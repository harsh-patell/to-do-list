
// Modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

// Very Important
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect to MongoDB Locally
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB on Atlast
// mongoose.connect("mongodb+srv://its_hp3:Asphalt10_@cluster0.nqsrl.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Item Schema
const itemSchema = new mongoose.Schema({ name: String });

// Item Model
const Item = mongoose.model("Item", itemSchema);

// Item Documents
const item1 = new Item({ name: "Meditation - 10 minutes" });
const item2 = new Item({ name: "Abs Workout - 10 minutes" });
const item3 = new Item({ name: "Read - 10 minutes" });
const defaultItems = [item1, item2, item3]

// List Schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// List Model
const List = mongoose.model("List", listSchema);


//GET 
app.get("/", (req, res) => {
    Item.find({}, function (err, foundItems) {
        
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) { console.log(err); }
                else { (console.log("default items inserted")); }
            });
          res.redirect("/");
        } else {
            res.render('list', { listTitle: "Today", newListItems: foundItems });
        }
    });
});

// Create Custom List
app.get("/:route", (req, res) => {

  const customListName = _.capitalize(req.params.route);

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create new List
        const list = new List({
          name: customListName,
          items: new Item({ name: "Item #1"})
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        // Show existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
});

// POST - Add items to respective list
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/"+listName);
  }

});

// Removing Items from Lists
app.post("/delete", (req, res) => {

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndDelete(checkedItemID, (err) => {
      if (err) { console.log(err); }
      else { console.log("item removed"); }
    });
    res.redirect("/");

  } else {
    List.updateOne({ name: listName }, { $pull: { items: { _id: checkedItemID } } }
      , (err) => {
        if (!err) {
          res.redirect("/" + listName)
          }
      });
  }
});


// Ports
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});


