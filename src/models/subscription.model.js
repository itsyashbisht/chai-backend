import mongoose from "mongoose";

// This schema takes user who is subscribing as "SUBSCRIBER" and to which channel he or she be subscribing as "CHANNEL".
const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      // One who is subscribing
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    channel: {
      // One to whom 'subscriber' is subscribing
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
