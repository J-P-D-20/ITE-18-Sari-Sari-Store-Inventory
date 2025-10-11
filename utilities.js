import {promises as fs} from 'fs'



const db_file = 'db.js';


export async function readData() {
    try{
        const data = await fs.readFile(db_file,'utf-8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err){
        console.error("Error reading file:", err);
        return [];
    }
}

export async function writeData(data) {
    await fs.writeFile(db_file,JSON.stringify(data,null,2), 'utf-8');
}

export async function updateData(id, update){
    try{
        const data = await readData();
        const parsed = JSON.parse(data);

        const index = parsed.findIndex(product => product.id === id);

        if(index === -1){
            throw new Error(`Item with ID "${id}" not found`);
        }

        parsed[index] = {...parsed[index], ...update};
        await writeData(parsed);
        return parsed[index];

    } catch (err){
        console.error("Unexpected Error: ", err);

    }
}


export async function deleteData(id) {
    try{
        const data = await readData()

        const filtered = data.filter(item => item.id !== id);
        
        if (filtered.length === data.length) {
        console.log(`Item with ID ${id} not found`);
        return false;
    }
        await writeData(filtered);
        return true;
    } catch (err){
        console.error("unexpected error: ", err);
    }
    
}

export async function countProducts() {
    try{
        const data = await readData();

        const numberOfProducts = data.length;

        return numberOfProducts;
    } catch (err){
        console.error("Unexpected Error: ", err);
    }
}

export async function lowStocks(){
      try{
        const data = await readData();

        const lowStockProducts = data.filter(product => product.Quantity < 10);

        return lowStockProducts;

        
    } catch (err){
        console.error("Unexpected Error: ", err);
    }
}


export async function outOfStocks(){
      try{
        const data = await readData();

        const lowStockProducts = data.filter(product => product.Quantity == 0);

        return lowStockProducts;

        
    } catch (err){
        console.error("Unexpected Error: ", err);
    }
}