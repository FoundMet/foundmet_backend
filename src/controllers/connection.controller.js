import ConnectionModel from "../models/connection.model.js";
import UserModel from "../models/user.model.js";

/**
 * Send a connection request to another founder
 * POST /api/v1/connections/request/:userId
 */
export async function sendConnectionRequest(req, res) {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.userId;

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required",
      });
    }

    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    // Check if target user exists
    const targetUser = await UserModel.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Founder not found",
      });
    }

    // Check if connection already exists
    const existing = await ConnectionModel.findOne({
      $or: [
        { fromUser: fromUserId, toUser: toUserId },
        { fromUser: toUserId, toUser: fromUserId },
      ],
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message:
          existing.status === "accepted"
            ? "Already connected with this founder"
            : "Connection request already sent",
        connection: existing,
      });
    }

    const connection = await ConnectionModel.create({
      fromUser: fromUserId,
      toUser: toUserId,
      status: "pending",
      message: req.body?.message || "",
    });

    return res.status(201).json({
      success: true,
      message: `Connection request sent to ${targetUser.name}!`,
      connection,
    });
  } catch (error) {
    console.error("Send Connection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send connection request",
    });
  }
}

/**
 * Get all connections and requests for the logged-in user
 * GET /api/v1/connections
 */
export async function getMyConnections(req, res) {
  try {
    const userId = req.user._id;

    const connections = await ConnectionModel.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
      .populate("fromUser", "name role address photo projectDetails projectStatus")
      .populate("toUser", "name role address photo projectDetails projectStatus")
      .sort({ createdAt: -1 });

    const sentRequests = connections.filter(
      (c) => c.fromUser?._id?.toString() === userId.toString() && c.status === "pending"
    );

    const receivedRequests = connections.filter(
      (c) => c.toUser?._id?.toString() === userId.toString() && c.status === "pending"
    );

    const connected = connections.filter((c) => c.status === "accepted");

    return res.status(200).json({
      success: true,
      totalCount: connections.length,
      connected,
      sentRequests,
      receivedRequests,
    });
  } catch (error) {
    console.error("Get Connections Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * Accept or reject a connection request
 * PUT /api/v1/connections/:connectionId
 */
export async function respondConnectionRequest(req, res) {
  try {
    const userId = req.user._id;
    const { connectionId } = req.params;
    const { status } = req.body; // 'accepted' | 'rejected'

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'accepted' or 'rejected'",
      });
    }

    const connection = await ConnectionModel.findOne({
      _id: connectionId,
      toUser: userId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found or already processed",
      });
    }

    connection.status = status;
    await connection.save();

    return res.status(200).json({
      success: true,
      message: `Connection request ${status}!`,
      connection,
    });
  } catch (error) {
    console.error("Respond Connection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * Remove or cancel a connection
 * DELETE /api/v1/connections/:connectionId
 */
export async function removeConnection(req, res) {
  try {
    const userId = req.user._id;
    const { connectionId } = req.params;

    const connection = await ConnectionModel.findOneAndDelete({
      _id: connectionId,
      $or: [{ fromUser: userId }, { toUser: userId }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove Connection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
