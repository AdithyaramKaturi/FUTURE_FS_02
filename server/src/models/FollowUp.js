import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Follow-up description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time are required'],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Creator admin reference is required']
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

followUpSchema.index({ scheduledAt: 1, status: 1 });
followUpSchema.index({ lead: 1, scheduledAt: -1 });

export const FollowUp = mongoose.model('FollowUp', followUpSchema);
