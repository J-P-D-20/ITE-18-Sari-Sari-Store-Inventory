import express from 'express';
import {readData,writeData,updateData,deleteData} from './utilities.js'


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




app.listen(3000);
console.log("server is listening to port 3000");