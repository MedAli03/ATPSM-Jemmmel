// controllers/childController.js
const getChildProgress = async (req, res) => {
    try {
      const [reports] = await pool.promise().query(`
        SELECT pr.*, u.name AS educator_name 
        FROM ProgressReports pr
        JOIN Users u ON pr.educator_id = u.id
        WHERE pr.child_id = ?
      `, [req.params.childId]);
      
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  const createProgressReport = async (req, res) => {
    const { educatorId, childId, description } = req.body;
    try {
      const [result] = await pool.promise().query(
        'INSERT INTO ProgressReports (date, description, child_id, educator_id) VALUES (CURDATE(), ?, ?, ?)',
        [description, childId, educatorId]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };