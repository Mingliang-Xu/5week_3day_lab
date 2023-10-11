require('dotenv').config()

const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.CONNECTION_STRING)

let nextEmp = 5

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, a.notes, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`
            UPDATE cc_appointments AS appt
            SET approved = true
            WHERE appt_id = ${apptId};

            insert into cc_emp_appts (emp_id, appt_id)
            values (${nextEmp}, ${apptId}),
            (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },
    getAllClients: (req, res) => {

        sequelize.query(`
            SELECT * FROM cc_users AS u
            JOIN cc_clients AS c
            ON u.user_id = c.user_id;
        `).then((dbRes => res.status(200).send(dbRes[0])))

    },
    getPendingAppointments: (req, res) => {
        
        sequelize.query(`
        SELECT * FROM cc_appointments AS appt
        WHERE approved = false 
        ORDER BY date DESC;
        `).then(dbRes=> res.status(200).send(dbRes[0]))

    },
    getPastAppointments: (req,res) => {

        sequelize.query(`
            SELECT appt.appt_id, appt.date, appt.service_type,appt.notes, appt.completed, u.first_name, u.last_name
            FROM cc_appointments AS appt
            
            join cc_emp_appts ea on appt.appt_id = ea.appt_id
            join cc_employees e on e.emp_id = ea.emp_id
            join cc_users u on e.user_id = u.user_id

            WHERE appt.approved = true
            AND appt.completed = true
            ORDER BY appt.date DESC;
        `).then(dbRes => res.status(200).send(dbRes[0]))


    },
    completeAppointment: (req, res) => {
        let {apptId} = req.body
        sequelize.query(`
            UPDATE cc_appointments AS appt
            SET completed = true
            WHERE appt_id = ${apptId};

        `).then(dbRes => res.status(200).send(dbRes[0]))
    }
}
