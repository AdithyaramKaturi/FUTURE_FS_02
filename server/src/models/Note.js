import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      trim: true,
      maxlength: [3000, 'Note cannot exceed 3000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Author reference is required']
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

noteSchema.index({ lead: 1, createdAt: -1 });

export const Note = mongoose.model('Note', noteSchema);
