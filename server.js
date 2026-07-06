const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname), {
    setHeaders: function(res, filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (['.html', '.js', '.css'].includes(ext)) {
            let contentType = res.getHeader('Content-Type');
            if (contentType && !contentType.includes('charset')) {
                res.setHeader('Content-Type', contentType + '; charset=utf-8');
            }
        }
    }
}));

// SQLite Database Setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        createTables();
    }
});

// Initialize Database Tables
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id TEXT NOT NULL,
            service_name TEXT NOT NULL,
            service_price REAL NOT NULL,
            service_duration INTEGER NOT NULL,
            date TEXT NOT NULL, -- Format: YYYY-MM-DD
            time TEXT NOT NULL, -- Format: HH:MM
            client_name TEXT NOT NULL,
            client_phone TEXT NOT NULL,
            client_notes TEXT,
            status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Reservations table checked/created successfully.');
        }
    });
}

// Define valid time slots (matching frontend app.js)
const VALID_SLOTS = [
    "09:00", "09:45", "10:30", "11:15", "12:00",
    "14:00", "14:45", "15:30", "16:15", "17:00", "17:45", "18:30"
];

// --- API ROUTES ---

// 1. Get availability (busy slots) for a specific date
app.get('/api/availability', (req, res) => {
    const { date } = req.query; // Expects YYYY-MM-DD
    
    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required.' });
    }
    
    // Find all reservations for this date that are not cancelled
    db.all(
        `SELECT time FROM reservations WHERE date = ? AND status != 'cancelled'`,
        [date],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error while checking availability.' });
            }
            
            // Map rows to an array of time strings
            const busySlots = rows.map(row => row.time);
            res.json(busySlots);
        }
    );
});

// 2. Create a new reservation
app.post('/api/reservations', (req, res) => {
    const {
        service_id,
        service_name,
        service_price,
        service_duration,
        date,
        time,
        client_name,
        client_phone,
        client_notes
    } = req.body;
    
    // Validation
    if (!service_id || !service_name || !date || !time || !client_name || !client_phone) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la reserva.' });
    }
    
    // Verify slot is valid
    if (!VALID_SLOTS.includes(time)) {
        return res.status(400).json({ error: 'El horario seleccionado no es válido.' });
    }
    
    // Check if slot is already taken
    db.get(
        `SELECT id FROM reservations WHERE date = ? AND time = ? AND status != 'cancelled'`,
        [date, time],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error de base de datos al validar disponibilidad.' });
            }
            
            if (row) {
                return res.status(400).json({ error: 'Lo sentimos, este horario ya ha sido reservado por otro cliente.' });
            }
            
            // Insert new reservation
            const stmt = db.prepare(`
                INSERT INTO reservations (
                    service_id, service_name, service_price, service_duration,
                    date, time, client_name, client_phone, client_notes, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `);
            
            stmt.run(
                [service_id, service_name, service_price, service_duration, date, time, client_name, client_phone, client_notes],
                function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Error al guardar la reserva en la base de datos.' });
                    }
                    
                    res.status(201).json({
                        message: 'Reserva registrada con éxito.',
                        reservationId: this.lastID
                    });
                }
            );
            stmt.finalize();
        }
    );
});

// 3. Get all reservations (for Admin Panel)
app.get('/api/reservations', (req, res) => {
    db.all(
        `SELECT * FROM reservations ORDER BY date DESC, time ASC`,
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error fetching reservations.' });
            }
            res.json(rows);
        }
    );
});

// 4. Update reservation status
app.put('/api/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // pending, confirmed, cancelled
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }
    
    db.run(
        `UPDATE reservations SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating reservation status.' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada.' });
            }
            
            res.json({ message: 'Estado de reserva actualizado correctamente.' });
        }
    );
});

// 5. Delete a reservation
app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        `DELETE FROM reservations WHERE id = ?`,
        [id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error deleting reservation.' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada.' });
            }
            
            res.json({ message: 'Reserva eliminada correctamente.' });
        }
    );
});

// Serve Admin Panel HTML
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
