import express from 'express';
import {readData,writeData,updateData,deleteData,countProducts, lowStocks, outOfStocks} from './utilities.js'


const app = express();
app.use(express.json());


app.post('/writeData', async (req,res) =>{
    const data = await readData();
    data.push(req.body);
    await writeData(data);

    res.send("Saved Successfully");
})


app.get("/displayData", async (req,res) => {
    const data = await readData();
    res.status(200).send(data)
})

app.put('/editData/:id', async (req,res) =>{
   try{
    const update = await updateData(Number(req.params.id),req.body);

     if (!update) {
      return res.status(404).send({ message: `Item with ID "${req.params.id}" not found` });
    }

      res.send({ message: 'Item updated', update });
   } catch (err){
        res.status(500).send({error : err.message});
   }
})

app.delete('/deleteData/:id', async (req,res) =>{
    try{
        const numID = Number(req.params.id);
        await deleteData(numID);

        res.send({ message : "Deleted Successfully"});
    } catch (err) {
        res.status(500).send({error: err.message});
    }
})

app.get('/countProducts', async (req,res) =>{
    try{
        const numOfProducts =  await countProducts()
        
        res.status(200).send(numOfProducts);
    } catch (err) {
        res.status(500).send({message : err.message});
    }
})


app.get('/lowStocks', async (req,res) => {
    try{
        const lowStockProducts = await lowStocks();
        
        res.status(200).send(lowStockProducts);
    } catch {
         res.status(500).send({message : err.message});
    }
})

app.get('/outOfStock', async (req,res) => {
    try{
        const outOfStock = await outOfStocks();
        
        res.status(200).send(outOfStock);
    } catch {
         res.status(500).send({message : err.message});
    }
})



const listen = () => {
    const PORT = 3000;
    app.listen(PORT,() =>{
        console.log(`Server is listening to port: ${PORT}`)
    })
}


listen();