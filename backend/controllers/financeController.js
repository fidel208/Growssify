const pool = require("../config/db");

exports.addTransaction = async (req, res) => {
  const { amount, description, type } = req.body;
  const activeUserId = req.userId;

  if (!amount || !description || !type) {
    return res.status(400).json({
      error: "All ledger transactional field attributes are required",
    });
  }

  try {
    const insertQuery = `
      INSERT INTO transactions (user_id, amount, description, type, created_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING transaction_id, amount, description, type, created_at;
    `;

    const newTx = await pool.query(insertQuery, [
      activeUserId,
      amount,
      description,
      type,
    ]);

    res.status(201).json({
      success: true,
      message: "Transaction logged successfully",
      transaction: newTx.rows[0],
    });
  } catch (err) {
    console.error("Ledger input operational failure:", err.message);
    res.status(500).json({ error: "Server database write exception error" });
  }
};

exports.getTransactions = async (req, res) => {
  const activeUserId = req.userId;

  try {
    const selectQuery = `
      SELECT transaction_id, amount, description, type, created_at 
      FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;

    const userLedger = await pool.query(selectQuery, [activeUserId]);

    res.json(userLedger.rows);
  } catch (err) {
    console.error("Ledger extraction operational failure:", err.message);
    res
      .status(500)
      .json({ error: "Server database extraction exception error" });
  }
};
