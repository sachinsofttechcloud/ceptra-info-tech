const express = require('express');


const healthRouter = require('./routes/health');
const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use('/api/health', healthRouter);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
