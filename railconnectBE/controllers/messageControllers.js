const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    if (req.params.chatId === "bot123") {
      return res.json([
        {
          _id: "bot_msg_1",
          sender: { _id: "bot123", name: "RailBot" },
          content: "Hi, I’m your AI assistant 🤖",
          chat: { _id: "bot123" },
        }
      ]);
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (chatId === "bot123") {
    // Mock the user's message being saved
    return res.json({
      _id: Math.random().toString(36).substr(2, 9),
      sender: { _id: req.user._id, name: req.user.name, pic: req.user.pic },
      content: content,
      chat: { _id: "bot123", users: [{_id: "bot123"}, req.user._id] },
    });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
