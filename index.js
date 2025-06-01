let express = require('express');
const cors = require('cors');
const { Pool } = require("pg");

let app = express();
app.use(cors());
app.use(express.json());

const { DATABASE_URL } = process.env;

//========================
// SETUP =================
//========================

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        require: true,
    },
});

async function getPostgresVersion() {
    const client = await pool.connect();
    try {
        const res = await client.query("select version()");
        console.log(res.rows[0]);
    } finally {
        client.release();
    }
};

getPostgresVersion();

//========================
// USER ==================
//========================

//Create (Sign-up)
app.post("/users", async(req, res) => {
    const client = await pool.connect();
    const {
        user_name,
        user_phone,
        user_email,
        user_age,
        user_gender,
        user_address,
        user_birth_date
    } = req.body;

    try {
        const user = await client.query(`
            INSERT INTO users (username, phonenumber, email, age, gender, address, birthdate, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                RETURNING *
        `, [user_name, user_phone, user_email, user_age, user_gender, user_address, user_birth_date]);

        res.json(user.rows);
    } catch (err) {
        res.status(500).json({
            error: `Created User: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Read (All Patient)
app.get("/users", async(req, res) => {
    const client = await pool.connect();

    try {
        const users = await client.query(`
            SELECT * FROM users
        `);

        res.json(users.rows);
    } catch (err) {
        res.status(500).json({
            error: `All User: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Read (Patient itself - Login) 
app.get("/users/:email", async(req, res) => {
    const client = await pool.connect();
    const email = req.params.email;

    try {
        let requestQuery = `SELECT * FROM users WHERE email = $1`;
        const user = await client.query(requestQuery, [email]);

        res.json(user.rows);
    } catch (err) {
        res.status(500).json({
            error: `Personal Detail: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Read (Doctor's Patient - All User) 
app.get("/users/:id/doctor", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const user = await client.query(`
            SELECT * FROM users WHERE stuff_id = $1
        `, [id]);

        res.json(user.rows);
    } catch (err) {
        res.status(500).json({
            error: `Personal Detail: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Update Detail (Personal Detail)
app.put("/users/detail/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const {
        user_name,
        user_phone,
        user_address
    } = req.body;

    try {
        const updateUser = await client.query(`
            UPDATE users
                SET username = $1, phonenumber = $2, address = $3
                WHERE id = $4
                RETURNING *;
        `, [user_name, user_phone, user_address, id])

        res.json({
            status: "Success",
            message: "User's detail has been updated without issues",
            updatedUser: updateUser.rows[0],
        })
    } catch (err) {
        res.status(500).json({
            error: `Update User: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Update Health (Personal Detail)
app.put("/users/health/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const {
        patient_status,
        patient_health,
        patient_description
    } = req.body;

    try {
        const updateUser = await client.query(`
            UPDATE users
                SET health_status = $1, health = $2, description = $3
                WHERE id = $4
                RETURNING *;
        `, [patient_status, patient_health, patient_description, id])

        res.json({
            status: "Success",
            message: "Patient's detail has been updated without issues",
            updatedUser: updateUser.rows[0],
        })
    } catch (err) {
        res.status(500).json({
            error: `Update User: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//Remove (Delete Account)
app.delete("/users/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const removeUser = await client.query(`
            DELETE FROM users
                WHERE id = $1
            RETURNING *
        `, [id]);

        res.json({
            status: "Success",
            message: "User deleted successfully",
            deletedUser: removeUser.rows[0],
        })
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
});

//========================
// STUFF =================
//========================

//Create Stuff Detail
app.post("/stuffs", async(req, res) => {
    const client = await pool.connect();
    const {
        stuff_name,
        stuff_address,
        stuff_phone,
        stuff_email,
        stuff_age,
        stuff_gender,
        stuff_birth_date,
        stuff_position,
        stuff_specialist,
        stuff_department,
    } = req.body;

    try {
        const newStuff = await client.query(`
            INSERT INTO stuffs (stuffname, address, phonenumber, email, age, gender, birthdate, stuffposition, specialist, department, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            RETURNING *
        `, [stuff_name, stuff_address, stuff_phone, stuff_email, stuff_age, stuff_gender, stuff_birth_date, stuff_position, stuff_specialist, stuff_department])

        res.json(newStuff.rows[0])
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

app.get("/stuffs/:email", async(req, res) => {
    const client = await pool.connect();
    const email = req.params.email;

    try {
        const stuff = await client.query(`
            SELECT * FROM stuffs WHERE email = $1 
        `, [email])

        res.json(stuff.rows);
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Read All Stuff
app.get("/stuffs", async(req, res) => {
    const client = await pool.connect();

    try {
        const stuffs = await client.query(`
            SELECT * FROM stuffs
        `);

        res.json(stuffs.rows);
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

app.get("/stuffs/:email", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const stuffs = await client.query(`
            SELECT * FROM stuffs WHERE id != $1
        `, [id]);

        res.json(stuffs.rows);
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Update Stuff Detail
app.put("/stuffs/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const {
        stuff_name,
        stuff_phone,
        stuff_address
    } = req.body;

    try {
        const updatedStuff = await client.query(`
            UPDATE stuffs 
                SET stuffname = $1, phonenumber = $2, address = $3
                WHERE id = $4
            RETURNING *
        `, [stuff_name, stuff_phone, stuff_address, id]);

        res.json({
            status: "Success",
            message: "Stuff has been updated",
            updatedStuff: updatedStuff.rows
        })
    } catch (err) {
        res.status(500).json({
            error: `Update personal (stuff) info: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Delete
app.delete("/stuffs/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const removeStuff = await client.query(`
            DELETE FROM stuffs
                WHERE id = $1
            RETURNING *
        `, [id])

        res.json({
            status: "Success",
            message: "Stuff has been deleted",
            deletedSfuff: removeStuff.rows[0],
        })
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//========================
// APPOINTMENT ===========
//========================

//Read User Appointment
app.get("/appts/users/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const appts = await client.query(`
            SELECT * FROM appointments WHERE user_id = $1
        `, [id]);

        res.json(appts.rows);
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Read Doctor Appointment
app.get("/appts/doctor/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const appts = await client.query(`
            SELECT * FROM appointments WHERE stuff_id = $1
        `, [id]);

        res.json(appts.rows);
    } catch (err) {
        res.status(500).json({
            error: `: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Read All Appointment
app.get("/appts", async(req, res) => {
    const client = await pool.connect();

    try {
        const appts = await client.query(`
            SELECT * FROM appointments
        `);

        res.json(appts.rows);
    } catch (err) {
        res.status(500).json({
            error: `Read Appointment: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Create
app.post("/appts", async(req, res) => {
    const client = await pool.connect();
    const {
        service_type,
        description,
        date,
        time,
        patient,
        doctor
    } = req.body;

    try {
        const newAppts = await client.query(`
            INSERT INTO appointments (servicetype, description, apptdate, appttime, user_id, stuff_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, [service_type, description, date, time, patient, doctor])

        res.json(newAppts.rows[0])
    } catch (err) {
        res.status(500).json({
            error: `Appointments Create: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Update
app.put("/appts/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const {
        appts_date,
        appts_time
    } = req.body;

    try {
        const updatedAppt = await client.query(`
            UPDATE appointments 
                SET apptdate = $1, appttime = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
            RETURNING *
        `, [appts_date, appts_time, id]);

        res.json({
            status: "Success",
            message: "Appointment has been updated",
            updatedAppt: updatedAppt.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            error: `Update personal (stuff) info: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//Delete
app.delete("/appts/:id", async(req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const removeAppts = await client.query(`
            DELETE FROM appointments
                WHERE id = $1
            RETURNING *
        `, [id])

        res.json({
            status: "Success",
            message: "Appointments has been deleted",
            deletedAppt: removeAppts.rows[0],
        })
    } catch (err) {
        res.status(500).json({
            error: `Error of Removing Appt: ${err.message}`
        });
    } finally {
        client.release();
    }
})

//========================
// LISTENER ==============
//========================

app.listen(3000, () => {
    console.log('App is listening on port 3000');
});