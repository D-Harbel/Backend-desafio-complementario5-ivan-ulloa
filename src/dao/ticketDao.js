const Ticket = require('../dao/models/ticketModel');

async function generateTicket(purchaser, amount) {
    try {
        const ticketData = {
            code: generateUniqueCode(),
            purchase_datetime: new Date(),
            amount: amount || 0,
            purchaser
        };
        const ticket = await Ticket.create(ticketData);
        return ticket;
    } catch (error) {
        console.error('Error al generar el ticket:', error);
        throw error;
    }
}

function generateUniqueCode() {
    const staticCode = 'TICKET'; 
    const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase(); 
    const timestampPart = Date.now().toString(36).toUpperCase(); 
    const uniqueCode = `${staticCode}-${randomPart}-${timestampPart}`; 
    return uniqueCode;
}


module.exports = {
    generateTicket
};