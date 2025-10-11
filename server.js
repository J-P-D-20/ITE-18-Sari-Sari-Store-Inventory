import express from 'express';
import cors from 'cors';
import {readData, writeData, updateData, deleteData, countProducts, lowStocks, outOfStocks} from './utilities.js'

const app = express();
app.use(express.json());
app.use(cors());

app.post('/writeData', async (req, res) => {
    try {
        const data = await readData();
        
        // Generate ID (highest existing ID + 1)
        const maxId = data.length > 0 ? Math.max(...data.map(p => p.id || 0)) : 0;
        const newProduct = {
            id: maxId + 1,
            ...req.body
        };
        
        data.push(newProduct);
        await writeData(data);

        res.status(201).send({ message: "Saved Successfully", product: newProduct });
    } catch (err) {
        console.error("Error saving product:", err);
        res.status(500).send({ error: err.message });
    }
})

app.get("/displayData", async (req, res) => {
    try {
        const data = await readData();
        res.status(200).send(data)
    } catch (err) {
        console.error("Error displaying data:", err);
        res.status(500).send({ error: err.message });
    }
})

app.put('/editData/:id', async (req, res) => {
    try {
        const update = await updateData(Number(req.params.id), req.body);

        if (!update) {
            return res.status(404).send({ message: `Item with ID "${req.params.id}" not found` });
        }

        res.send({ message: 'Item updated', update });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).send({ error: err.message });
    }
})

app.delete('/deleteData/:id', async (req, res) => {
    try {
        const numID = Number(req.params.id);
        const result = await deleteData(numID);

        if (!result) {
            return res.status(404).send({ message: `Item with ID "${numID}" not found` });
        }

        res.send({ message: "Deleted Successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).send({ error: err.message });
    }
})

app.get('/countProducts', async (req, res) => {
    try {
        const numOfProducts = await countProducts()
        res.status(200).send(numOfProducts);
    } catch (err) {
        console.error("Error counting products:", err);
        res.status(500).send({ message: err.message });
    }
})

app.get('/lowStocks', async (req, res) => {
    try {
        const lowStockProducts = await lowStocks();
        res.status(200).send(lowStockProducts);
    } catch (err) {
        console.error("Error fetching low stocks:", err);
        res.status(500).send({ message: err.message });
    }
})

app.get('/outOfStock', async (req, res) => {
    try {
        const outOfStock = await outOfStocks();
        res.status(200).send(outOfStock);
    } catch (err) {
        console.error("Error fetching out of stock:", err);
        res.status(500).send({ message: err.message });
    }
})

const listen = () => {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is listening to port: ${PORT}`)
    })
}

listen();
