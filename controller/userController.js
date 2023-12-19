const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));


exports.getAllusers = (req,res) => {
    res.status(200).json({
        status:'success',
        data: {
            users
        }
    })
};

exports.getOneUser = (req, res) => {
    const id = req.params.id;
    const item = users.find(item => item._id === id);
  
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
  
    res.status(200).json({
        status:'success',
        data: {
            item
        }
    })
};

exports.createUser = (req, res) => {
    const newId = uuidv4();
    const newItem = Object.assign({_id:newId},req.body);
    users.push(newItem);

    fs.writeFileSync(
        `${__dirname}/../dev-data/data/users.json`,
        JSON.stringify(users),
        err => {
            res.status(201).json({
                status:"success",
                data:{
                    user: newItem
                }
            });
        }
    )

    res.status(201).json({
        status:"success",
        data:{
            user: newItem
        }
    });
};

exports.updateUser = (req, res) => {
    const item = users.find(item => item._id === req.params.id);
    if(!item){
        return res.status(404).json({
            status:"failed",
            message:"Invalid Id"
        });
    }
    const id = req.params.id;
    const index = users.findIndex(item => item._id === id);
    const updatedItem =Object.assign({_id:id},req.body);

    if (index !== -1) {
        // Update the item at the found index with the updated data
        users[index] = { ...users[index], ...updatedItem };
        fs.writeFileSync(
            `${__dirname}/../dev-data/data/users.json`,
            JSON.stringify(users),
            err => {
                res.status(201).json({
                    status:"success",
                    data:{
                        user: newItem
                    }
                });
            }
        )
        res.status(200).json({
            status:"success",
            data:{
                user:users[index]
            }
        }); // Return the updated item
      } else {
        res.status(404).json({ error: 'Item not found' }); // Handle the case when the item is not found
      }
};

exports.deleteUser = (req, res) => {
    const item = users.find(item => item._id === req.params.id);
    if(!item){
        return res.status(404).json({
            status:"failed",
            message:"Invalid Id"
        });
    }
    const id = req.params.id;
    const index = users.findIndex(item => item._id === id);
    
    if (index !== -1) {
        // Remove the item at the found index
        users.splice(index, 1);
        fs.writeFileSync(
            `${__dirname}/../dev-data/data/users.json`,
            JSON.stringify(users),
            err => {
                res.status(201).json({
                    status:"success",
                    data:{
                        user: newItem
                    }
                });
            }
        )
        res.status(204).json({
            status:"success",
            message:"deleted"
        }); // Return a 204 No Content response
    } else {
        res.status(404).json({ error: 'Item not found' }); // Handle the case when the item is not found
    }
};
