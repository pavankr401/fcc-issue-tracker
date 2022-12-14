'use strict';

const { ObjectId, ObjectID } = require("mongodb");

module.exports = function (app, myDatabase) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let {project} = req.params;
      let query = req.query;
      query.project = project;

      if(query.open != undefined) query.open = Boolean(query.open);
      if(query._id != undefined) query._id = new ObjectId(query._id);
      // console.log(query);
      // it gives us promise
      let docs = myDatabase.find(query).toArray();
      docs.then((data) => res.send(data));
    })

    .post(function (req, res) {
      const {project} = req.params;
      let { issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      
      if( issue_title == undefined || issue_text == undefined || created_by == undefined )
        return res.send({ error: 'required field(s) missing' });

      if(open == undefined) open = true;
      if(assigned_to == undefined) assigned_to = "";
      if(status_text == undefined) status_text = "";

      let doc = {
        project: project,
        assigned_to: assigned_to,
        status_text: status_text,
        open: open,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        created_on: new Date(),
        updated_on: new Date()
      };

      myDatabase.insertOne(doc, (err, user) => {
        // console.log(user);
        res.send({
          assigned_to: assigned_to,
          status_text: status_text,
          open: open,
          _id: user.insertedId,
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          created_on: doc.created_on,
          updated_on: doc.updated_on
        });
      });
    })

    .put(function (req, res) {
      let { _id } = req.body;
      if(_id == undefined) return res.send({ error: 'missing _id' });
     if(Object.keys(req.body).length == 1) return res.send({error: 'no update field(s) sent', '_id': _id});

      let { project } = req.params;
      
      let doc = req.body;
      delete doc._id;
      doc.updated_on = new Date();

      myDatabase.findOne({_id: new ObjectId(_id)}, (err, user) => {
        if(user == null) return res.send({ error: "could not update", _id: _id });
        

        if( doc.issue_title == undefined) doc.issue_title = "";
        if( doc.issue_text == undefined) doc.issue_text = "";
        if( doc.created_by == undefined) doc.created_by = "";

        if(doc.assigned_to == undefined) doc.assigned_to = "";
        if(doc.status_text == undefined) doc.status_text = "";
        if (doc.open == undefined) doc.open = true;

        let filter = { _id: new ObjectId(_id), project: project };
        myDatabase.findOneAndUpdate(filter, {$set: doc}, (err, user) => {
          // console.log(err);
          // console.log(user);
          if ( user) res.send({result: 'successfully updated', '_id': _id });
          else res.send({ error: "could not update", _id: _id });
        });
      })
    })

    .delete(function (req, res) {
      let {_id} = req.body;
      
      if(Object.keys(req.body).length > 1) return res.send({error: "could not delete", _id: _id});
      if(_id == undefined) return res.send({error: "missing _id"});


      myDatabase.deleteOne({ _id: new ObjectId(_id) }, (err, user) => {
        try{
          if(user.deletedCount == 1) res.send({result: "successfully deleted", _id: _id});
          else res.send({error: "missing _id"});
        }
        catch(e){
          res.send({error: "could not delete", _id: _id});
        }
      })

    });

};
