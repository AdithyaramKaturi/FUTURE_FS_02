import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Admin } from '../src/models/Admin.js';
import { Lead } from '../src/models/Lead.js';
import { Note } from '../src/models/Note.js';
import { FollowUp } from '../src/models/FollowUp.js';
import { config } from '../src/config/env.js';

let authToken = '';
let testAdminId = '';
let createdLeadId = '';
let createdFollowUpId = '';

beforeAll(async () => {
  // Use test database to keep things isolated
  const testUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/leadflow-crm-test';
  await connectDB(testUri);

  // Clean test db
  await Promise.all([
    Admin.deleteMany({}),
    Lead.deleteMany({}),
    Note.deleteMany({}),
    FollowUp.deleteMany({})
  ]);

  // Create test admin
  const passwordHash = await Admin.hashPassword('Admin@123456');
  const admin = await Admin.create({
    name: 'Test Superadmin',
    email: 'admin.test@leadflow.io',
    passwordHash,
    role: 'superadmin'
  });
  testAdminId = admin._id.toString();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  }
});

describe('1. Public Contact Form API', () => {
  it('should accept valid public lead submission and return safe message', async () => {
    const res = await request(app)
      .post('/api/public/leads')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1 555-0199',
        company: 'Acme Design Co',
        serviceInterested: 'Web Development',
        message: 'Looking for a new e-commerce web platform for our spring catalog launch.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('received');
    // Ensure no sensitive database IDs or fields leaked
    expect(res.body._id).toBeUndefined();
  });

  it('should reject invalid public lead submission with missing message and invalid email', async () => {
    const res = await request(app)
      .post('/api/public/leads')
      .send({
        name: 'J',
        email: 'not-an-email'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('2. Authentication API', () => {
  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.test@leadflow.io',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid credentials and return token & user info', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.test@leadflow.io',
        password: 'Admin@123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin.test@leadflow.io');
    authToken = res.body.token;
  });

  it('should reject access to protected /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access to protected /api/auth/me with Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('admin.test@leadflow.io');
  });
});

describe('3. Leads Management CRUD API', () => {
  it('should create a lead manually as admin', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Robert Vance',
        email: 'robert@vancerefrigeration.com',
        phone: '555-444-3333',
        company: 'Vance Refrigeration',
        serviceInterested: 'Full-Stack App',
        message: 'Need a logistics tracker for refrigeration units.',
        source: 'referral',
        status: 'new',
        value: 15000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Robert Vance');
    expect(res.body.data.value).toBe(15000);
    createdLeadId = res.body.data._id;
  });

  it('should list leads with pagination and search', async () => {
    const res = await request(app)
      .get('/api/leads?search=Vance&page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it('should get lead details by ID', async () => {
    const res = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdLeadId);
    expect(Array.isArray(res.body.data.notes)).toBe(true);
    expect(Array.isArray(res.body.data.followUps)).toBe(true);
  });

  it('should update lead status to contacted', async () => {
    const res = await request(app)
      .patch(`/api/leads/${createdLeadId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'contacted' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('contacted');
  });
});

describe('4. Notes API', () => {
  it('should add a persistent note to a lead', async () => {
    const res = await request(app)
      .post(`/api/leads/${createdLeadId}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Called Robert Vance, scheduled intro call.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Called Robert Vance, scheduled intro call.');
    expect(res.body.data.createdBy.name).toBe('Test Superadmin');
  });

  it('should fetch notes for a lead', async () => {
    const res = await request(app)
      .get(`/api/leads/${createdLeadId}/notes`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});

describe('5. Follow-ups API', () => {
  it('should schedule a follow-up for a lead', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(app)
      .post(`/api/leads/${createdLeadId}/follow-ups`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Send contract draft and timeline estimate.',
        scheduledAt: tomorrow.toISOString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    createdFollowUpId = res.body.data._id;
  });

  it('should list follow-ups', async () => {
    const res = await request(app)
      .get('/api/follow-ups?timeframe=all')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should mark follow-up as completed', async () => {
    const res = await request(app)
      .patch(`/api/follow-ups/${createdFollowUpId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });
});

describe('6. Analytics API', () => {
  it('should return KPI overview calculations', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalLeads).toBe('number');
    expect(typeof res.body.data.conversionRate).toBe('number');
    expect(res.body.data.totalLeads).toBeGreaterThan(0);
  });

  it('should return leads over time breakdown', async () => {
    const res = await request(app)
      .get('/api/analytics/leads-over-time')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return leads by status distribution', async () => {
    const res = await request(app)
      .get('/api/analytics/leads-by-status')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
