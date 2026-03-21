require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectionsRouter = require('./routes/projections');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/projections', projectionsRouter);

app.listen(PORT, () => {
  console.log(`Risus server running on port ${PORT}`);
});
