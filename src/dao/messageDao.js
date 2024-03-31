const { Message } = require('./index');

class MessageDao {
    async getMessages() {
        return await Message.find();
    }

    async addMessage(user, message) {
        const newMessage = new Message({ user, message });
        await newMessage.save();
        return newMessage;
    }
}

module.exports = new MessageDao();