const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const csv = require('csv-writer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/daily_expenses' );

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    password: String
});

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    splitType: String,
    participants: Array,
    createdBy: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

const validateExpense = (req, res, next) => {
    const { amount, participants, splitType } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ error: 'Invalid participants' });
    }
    if (!['equal', 'exact', 'percentage'].includes(splitType)) {
        return res.status(400).json({ error: 'Invalid split type' });
    }
    next();
};

app.post('/users/register', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, mobile, password: hashedPassword });
    await user.save();
    res.json(user);
});

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send('Invalid credentials.');

    const token = jwt.sign({ userId: user._id, email: user.email }, 'your_jwt_secret_key', { expiresIn: '1h' });
    res.json({ token });
});

app.get('/users/:id', authenticateToken, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found.');
    res.json(user);
});

app.post('/expenses', authenticateToken, validateExpense, async (req, res) => {
    const { description, amount, splitType, participants } = req.body;

    const expense = new Expense({
        description,
        amount,
        splitType,
        participants,
        createdBy: req.user.userId
    });

    await expense.save();
    res.json(expense);
});

app.get('/expenses', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const expenses = await Expense.find()
        .skip((page - 1) * limit)
        .limit(limit);

    res.json(expenses);
});

app.get('/balance-sheet', authenticateToken, async (req, res) => {
    const expenses = await Expense.find({ createdBy: req.user.userId });

    const csvWriter = csv.createObjectCsvWriter({
        path: 'balance-sheet.csv',
        header: [
            { id: 'description', title: 'Description' },
            { id: 'amount', title: 'Amount' },
            { id: 'splitType', title: 'Split Type' }
        ]
    });

    const data = expenses.map(exp => ({
        description: exp.description,
        amount: exp.amount,
        splitType: exp.splitType
    }));

    await csvWriter.writeRecords(data);

    res.download('balance-sheet.csv', 'balance-sheet.csv', (err) => {
        if (err) return res.status(500).send('Error downloading the file');
        fs.unlinkSync('balance-sheet.csv');
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
