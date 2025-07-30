import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.ObjectId, // One who is subscribing
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.ObjectId, // One to whom 'subscriber' is subscribing
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
