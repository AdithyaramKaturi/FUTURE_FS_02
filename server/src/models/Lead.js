import mongoose from 'mongoose';

export const LEAD_STATUSES = ['new', 'contacted', 'converted', 'lost'];
export const LEAD_SOURCES = ['website', 'referral', 'linkedin', 'google', 'cold-outreach', 'other'];
export const SERVICES_INTERESTED = [
  'Web Development',
  'UI/UX Design',
  'Full-Stack App',
  'SEO & Marketing',
  'Consulting',
  'Other'
];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
      default: ''
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
      default: ''
    },
    serviceInterested: {
      type: String,
      enum: {
        values: SERVICES_INTERESTED,
        message: '{VALUE} is not a supported service'
      },
      default: 'Web Development'
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    source: {
      type: String,
      enum: {
        values: LEAD_SOURCES,
        message: '{VALUE} is not a supported lead source'
      },
      default: 'website'
    },
    status: {
      type: String,
      enum: {
        values: LEAD_STATUSES,
        message: '{VALUE} is not a valid lead status'
      },
      default: 'new'
    },
    value: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0
    },
    nextFollowUpAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Search text index for rapid multi-field searching
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

// Compound and single indexes for fast filtered lookups and analytics
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ nextFollowUpAt: 1 });

export const Lead = mongoose.model('Lead', leadSchema);
