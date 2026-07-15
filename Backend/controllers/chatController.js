import mongoose from "mongoose";

import Chat from "../Models/Chat.js";
import Session from "../Models/Session.js";
import User from "../Models/User.js";


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const checkSessionAccess = (
  session,
  userId,
  userRole
) => {
  const currentUserId =
    userId.toString();

  const trainerId =
    session.trainerId?.toString();

  const isTeacher =
    trainerId === currentUserId;

  const isParticipant =
    Array.isArray(
      session.participants
    ) &&
    session.participants.some(
      (participantId) =>
        participantId.toString() ===
        currentUserId
    );

  const isAdmin =
    userRole === "Admin";

  return {
    isTeacher,
    isParticipant,
    isAdmin,
    hasAccess:
      isTeacher ||
      isParticipant ||
      isAdmin,
  };
};


const populateChatMessage = (
  query
) => {
  return query
    .populate(
      "senderId",
      "name email role isActive"
    )
    .populate(
      "sessionId",
      "sessionName trainerId status startTime endTime"
    );
};


export const sendMessage = async (
  req,
  res
) => {
  try {
    const authenticatedUserId =
      req.user?.userId;

    const {
      sessionId,
      message,
      messageType = "Text",
      fileUrl,
    } = req.body;

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !isValidObjectId(
        authenticatedUserId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "Session ID is required",
      });
    }

    if (
      !isValidObjectId(sessionId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session ID",
      });
    }

    const normalizedMessageType =
      typeof messageType === "string"
        ? messageType.trim()
        : "";

    if (
      !["Text", "File"].includes(
        normalizedMessageType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message type must be Text or File",
      });
    }

    const cleanedMessage =
      typeof message === "string"
        ? message.trim()
        : "";

    /*
    Text message validation.
    */
    if (
      normalizedMessageType ===
        "Text" &&
      !cleanedMessage
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot be empty",
      });
    }

    /*
    File message validation.
    */
    const cleanedFileUrl =
      typeof fileUrl === "string"
        ? fileUrl.trim()
        : "";

    if (
      normalizedMessageType ===
        "File" &&
      !cleanedFileUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File URL is required for file messages",
      });
    }

    if (
      cleanedMessage.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 1000 characters",
      });
    }

    
    const [sender, session] =
      await Promise.all([
        User.findById(
          authenticatedUserId
        ).select(
          "_id name email role isActive"
        ),

        Session.findById(sessionId),
      ]);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!sender.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Account disabled. Please contact the administrator.",
      });
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (
      session.status ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Messages cannot be sent to a cancelled session",
      });
    }


    const sessionAccess =
      checkSessionAccess(
        session,
        authenticatedUserId,
        sender.role
      );

    if (!sessionAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant of this session",
      });
    }

    
    const chat = await Chat.create({
      sessionId,
      senderId:
        authenticatedUserId,
      senderName: sender.name,

      message:
        cleanedMessage ||
        "File attachment",

      messageType:
        normalizedMessageType,

      fileUrl:
        normalizedMessageType ===
        "File"
          ? cleanedFileUrl
          : null,

      timestamp: new Date(),
    });

    const populatedChat =
      await populateChatMessage(
        Chat.findById(chat._id)
      );

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      chat: populatedChat,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Chat validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (validationError) =>
            validationError.message
        ),
      });
    }

    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to send message due to a database error",
    });
  }
};


export const getSessionMessages =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const authenticatedUserId =
        req.user?.userId;

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      if (
        !isValidObjectId(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid session ID",
        });
      }

      const [user, session] =
        await Promise.all([
          User.findById(
            authenticatedUserId
          ).select(
            "_id name email role isActive"
          ),

          Session.findById(
            sessionId
          ),
        ]);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message:
            "Account disabled. Please contact the administrator.",
        });
      }

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Session not found",
        });
      }

      /*
      Validate session access.
      */
      const sessionAccess =
        checkSessionAccess(
          session,
          authenticatedUserId,
          user.role
        );

      if (
        !sessionAccess.hasAccess
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view messages from this session",
        });
      }

      /*
      Pagination.
      */
      let page =
        Number.parseInt(
          req.query.page,
          10
        ) || 1;

      let limit =
        Number.parseInt(
          req.query.limit,
          10
        ) || 100;

      if (page < 1) {
        page = 1;
      }

      if (limit < 1) {
        limit = 100;
      }

      if (limit > 200) {
        limit = 200;
      }

      const skip =
        (page - 1) * limit;

      const [
        messages,
        totalMessages,
      ] = await Promise.all([
        Chat.find({
          sessionId,
        })
          .populate(
            "senderId",
            "name email role isActive"
          )
          .sort({
            timestamp: 1,
            createdAt: 1,
          })
          .skip(skip)
          .limit(limit),

        Chat.countDocuments({
          sessionId,
        }),
      ]);

      return res.status(200).json({
        success: true,
        message:
          messages.length > 0
            ? "Session messages retrieved successfully"
            : "No messages found for this session",

        session: {
          id: session._id,
          sessionName:
            session.sessionName,
          status:
            session.status,
          trainerId:
            session.trainerId,
        },

        count: messages.length,

        pagination: {
          currentPage: page,
          totalPages:
            Math.ceil(
              totalMessages /
                limit
            ),
          totalMessages,
          limit,
        },

        messages,
      });
    } catch (error) {
      console.error(
        "Get session messages error:",
        error
      );

      if (
        error.name === "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid session ID",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve session messages due to a database error",
      });
    }
  };


export const deleteMessage = async (
  req,
  res
) => {
  try {
    const { messageId } =
      req.params;

    const authenticatedUserId =
      req.user?.userId;

    const authenticatedUserRole =
      req.user?.role;

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !isValidObjectId(messageId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid message ID",
      });
    }

    if (
      !["Teacher", "Admin"].includes(
        authenticatedUserRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Teacher or Admin can delete messages",
      });
    }

    const chat =
      await Chat.findById(
        messageId
      );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    const session =
      await Session.findById(
        chat.sessionId
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "Session associated with this message was not found",
      });
    }

    const isAdmin =
      authenticatedUserRole ===
      "Admin";

    const isSessionTeacher =
      session.trainerId
        ?.toString() ===
      authenticatedUserId.toString();

    /*
    Teacher can delete only messages
    from their own session.
    */
    if (
      !isAdmin &&
      !isSessionTeacher
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can delete messages only from sessions managed by you",
      });
    }

    await Chat.findByIdAndDelete(
      messageId
    );

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successfully",
      deletedMessageId:
        messageId,
    });
  } catch (error) {
    console.error(
      "Delete message error:",
      error
    );

    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid message ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete message due to a database error",
    });
  }
};