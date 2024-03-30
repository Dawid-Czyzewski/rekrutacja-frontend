import React, { useState, useEffect } from 'react';
import AddSmsModal from '../modals/AddSmsModal';
import '../styles/DashboardPage.css';

function DashboardPage() {
    const [smsList, setSmsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingSmsId, setEditingSmsId] = useState(null);
    const [editedSmsContent, setEditedSmsContent] = useState('');
    const [editedSms, setEditedSms] = useState(null);
    const [sortedField, setSortedField] = useState(null);
    const [filteredText, setFilteredText] = useState('');
    const [isAscending, setIsAscending] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newSmsContent, setNewSmsContent] = useState('');

    useEffect(() => {
        handleFetchSms();
        const interval = setInterval(() => {
            handleFetchSms();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchAllSmsPages = async () => {
        try {
            const token = localStorage.getItem('token');
            let allSmsList = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const response = await fetch(`http://127.0.0.1:8000/docs/smss?page=${page}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.error('Błąd pobierania danych:', response.statusText);
                    break;
                }

                const data = await response.json();
                const smsList = data['hydra:member'];

                if (smsList.length === 0) {
                    hasNextPage = false;
                } else {
                    allSmsList = [...allSmsList, ...smsList];
                    page++;
                }
            }

            setSmsList(allSmsList);
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const handleDeleteSms = async (smsId) => {
        try {
            setSmsList(smsList.filter(sms => sms.id !== smsId));

            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/docs/smss/${smsId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Błąd usuwania SMS:', response.statusText);
                return;
            }

        } catch (error) {
            console.error('Wystąpił błąd podczas usuwania SMS:', error);
        }
    };


    const handleFetchSms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/fetch-sms', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Błąd pobierania SMS:', response.statusText);
                return;
            }

            fetchAllSmsPages();
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania SMS:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSms = (smsId) => {
        setEditingSmsId(smsId);
        const editedSms = smsList.find(sms => sms.id === smsId);
        if (editedSms) {
            setEditedSms(editedSms);
            setEditedSmsContent(editedSms.contentOfMessage);
        }
    };

    const handleSaveEditedSms = async () => {
        try {
            const token = localStorage.getItem('token');
            const editedSmsCopy = { ...editedSms };
            editedSmsCopy.contentOfMessage = editedSmsContent;

            delete editedSmsCopy['@id'];
            delete editedSmsCopy['@type'];
            const id = editedSmsCopy['id'];
            delete editedSmsCopy['id'];

            const originalDate2 = new Date(editedSmsCopy['addDate']);
            originalDate2.setHours(originalDate2.getHours() + 1);
            const convertedDate2 = originalDate2.toISOString();

            editedSmsCopy['addDate'] = convertedDate2;


            const originalDate = new Date(editedSmsCopy['add_date']);
            originalDate.setHours(originalDate.getHours() + 1);
            const convertedDate = originalDate.toISOString();

            editedSmsCopy['add_date'] = convertedDate;

            const response = await fetch(`http://127.0.0.1:8000/docs/smss/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/ld+json'
                },
                body: JSON.stringify(editedSmsCopy)
            });

            fetchAllSmsPages();
            setEditingSmsId(null);
            setEditedSmsContent('');
            setEditedSms(null);
        } catch (error) {
            console.error('Wystąpił błąd podczas edycji SMS:', error);
        }
    };

    const handleSort = (field) => {
        const isCurrentlySortedField = sortedField === field;
        setIsAscending(isCurrentlySortedField ? !isAscending : true);
        setSortedField(field);
    
        const sortedList = [...smsList].sort((a, b) => {
            if (a[field] < b[field]) return isAscending ? -1 : 1;
            if (a[field] > b[field]) return isAscending ? 1 : -1;
            return 0;
        });
    
        setSmsList(sortedList);
    };

    const handleFilter = (text) => {
        if (text.trim() === '') {
            setFilteredText('');
            fetchAllSmsPages();
        } else {
            const filteredList = smsList.filter(sms =>
                sms.sender.toLowerCase().includes(text.toLowerCase()) ||
                sms.recipient.toLowerCase().includes(text.toLowerCase()) ||
                sms.contentOfMessage.toLowerCase().includes(text.toLowerCase()) ||
                new Date(sms.add_date).toLocaleString().toLowerCase().includes(text.toLowerCase())
            );
    
            setFilteredText(text);
            setSmsList(filteredList);
        }
    };

    const handleAddSms = async (newSms) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/docs/smss', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/ld+json'
                },
                body: JSON.stringify(newSms)
            });

            fetchAllSmsPages();
            setShowModal(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas dodawania SMS:', error);
        }
    };

    return (
        <div className="container">
            {loading && <div className="loading-modal">Trwa ładowanie...</div>}
            <div className="button-container">
                <button className="button" onClick={handleFetchSms}>Pobierz SMS</button>
                <button className="button" onClick={handleLogout}>Wyloguj</button>
                <input
                    type="text"
                    placeholder="Filtruj..."
                    value={filteredText}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="filter-input"
                />
                <button className="button" onClick={() => setShowModal(true)}>Dodaj nowy SMS</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('sender')}>
                                Nadawca {sortedField === 'sender' && (isAscending ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('recipient')}>
                                Odbiorca {sortedField === 'recipient' && (isAscending ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('contentOfMessage')}>
                                Treść wiadomości {sortedField === 'contentOfMessage' && (isAscending ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('add_date')}>
                                Data dodania {sortedField === 'add_date' && (isAscending ? '▲' : '▼')}
                            </th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {smsList.map((sms) => (
                            <tr key={sms.id}>
                                <td>{sms.sender}</td>
                                <td>{sms.recipient}</td>
                                <td>
                                    {editingSmsId === sms.id ? (
                                        <input
                                            type="text"
                                            value={editedSmsContent}
                                            onChange={(e) => setEditedSmsContent(e.target.value)}
                                        />
                                    ) : (
                                        sms.contentOfMessage
                                    )}
                                </td>
                                <td>{new Date(sms.add_date).toLocaleString()}</td>
                                    {editingSmsId === sms.id ? (
                                        <button className="button" onClick={handleSaveEditedSms}>Zapisz</button>
                                    ) : (
                                        <>
                                            <button className="button" onClick={() => handleEditSms(sms.id)}>Edytuj</button>
                                            <button className="button" onClick={() => handleDeleteSms(sms.id)}>Usuń</button>
                                        </>
                                    )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <AddSmsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onAdd={handleAddSms}
            />
        </div>
    );
}    
export default DashboardPage;
