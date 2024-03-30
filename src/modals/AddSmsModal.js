import React, { useState } from 'react';
import '../styles/AddSmsModal.css';

function AddSmsModal({ show, onClose, onAdd }) {
    const [sender, setSender] = useState('');
    const [recipient, setRecipient] = useState('');
    const [contentOfMessage, setContentOfMessage] = useState('');

    const handleAddSms = () => {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 1);
        const formattedDate = currentDate.toISOString();

        const newSms = {
            sender: sender,
            recipient: recipient,
            contentOfMessage: contentOfMessage,
            add_date: formattedDate,
            addDate: formattedDate
        };
        onAdd(newSms);
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <div className="input-container">
                    <input
                        type="text"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        placeholder="Nadawca"
                    />
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Odbiorca"
                    />
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={contentOfMessage}
                        onChange={(e) => setContentOfMessage(e.target.value)}
                        placeholder="Treść wiadomości"
                    />
                </div>
                <button className="button" onClick={handleAddSms}>Dodaj SMS</button>
            </div>
        </div>
    );
}

export default AddSmsModal;