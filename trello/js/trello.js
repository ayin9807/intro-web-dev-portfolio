/*
 *
 * @author Annie Yin
 *
 */

// set up for Firebase
var config = {
    apiKey: "AIzaSyCOpKpuiilP3K2GwdXPgeCWXyyIp2b7s8A",
    authDomain: "trello-7944d.firebaseapp.com",
    databaseURL: "https://trello-7944d.firebaseio.com",
    projectId: "trello-7944d",
    storageBucket: "trello-7944d.appspot.com",
    messagingSenderId: "1080021306421"
};
  
// global access to initialized app database
var db = firebase.initializeApp(config).database();
// global reference to remote storage
var storageRef = firebase.storage().ref();
// global reference to remote data
var listRef = db.ref('listData');
var userRef = db.ref('userData');
var categoryRef = db.ref('categoryData');
var backgroundRef = db.ref('background');
db.ref('background').once('value', function(snapshot) {
    console.log(snapshot.val().name);
    if (snapshot.val().name.indexOf('https') >= 0) {
        $('#app').css('background-image', 'url("' + snapshot.val().name + '")');
    } else {
        $('#app').css('background-color', snapshot.val().name);
    }
});

userRef.once('value', function(snapshot) {
    if (snapshot.val().logged == '') {
        $('#log-in').css('display', 'block');
        $('#sign-up').css('display', 'block');
        $('#change-info').css('display', 'none');
        $('#log-out').css('display', 'none');
    } else {
        $('#log-in').css('display', 'none');
        $('#sign-up').css('display', 'none');
        $('#change-info').css('display', 'block');
        $('#log-out').css('display', 'block');
        userRef.child(snapshot.val().logged).once('value', function(snapshot) {
            var image = $('<img id="user-header-image" src=' + snapshot.val()['image'] + ' >')
            image.css('height', '50px');
            image.css('width', '35px');
            image.css('border-radius', '10%');
            $('#user-header').append(image); 
        });
    }
});

// connect Firebase to Vue
Vue.use(VueFire);

var app = new Vue ({
    el: '#app',
    data: {
        // listData: lists
        newCard: {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true, users: [], comments: []},
        newList: {name: '', cards: [], id: null},
        newUser: {name: '', email: '', image: '', id: null, status: false},
        newCategory: {name: '', color: ''},
        newName: '',
        userKey: '',
        clicked: 0,
        changed: 0,
        dragElement: null,
        listTo: '',
        newComment: ''
    },
    
    firebase: {
        listData: listRef,
        categoryData: categoryRef,
        userData: userRef,
        background: backgroundRef
    },
    
    methods: {
        getURLPromise: function(f) {
            return storageRef.child('images/' + f.name).put(f).then(function(snapshot) {
                return snapshot.downloadURL;   
            });
        },

        // add card to list
        // Firebase: DONE
        addCard: function (list) {
            var self = this;

            // load modal
            var modal = $('#add-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            // once user saves card
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');       

                if (self.newCard.name) {
                    var today = new Date();
                    self.newCard.dateCreated = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
                    listRef.child(list['.key']).child('cards').once('value', function(snapshot) {
                        self.newCard.id = snapshot.numChildren();
                    });

                    var images = document.getElementById('card-files');

                    // if there are images
                    if (images.files.length > 0) {
                        // store variables to push later
                        var name = self.newCard.name.trim();
                        var description = self.newCard.description.trim();
                        var deadline = self.newCard.deadline.trim();
                        var categories = self.newCard.categories;
                        var todos = self.newCard.todos;

                        var file = images.files;
                        var allURLs = [];
                        for (var i = 0; i < file.length; i++) {
                            // console.log(file[i]);
                            allURLs.push(self.getURLPromise(file[i]));
                        }
                        
                        // wait for all URLs to be fetched, then push new card
                        Promise.all(allURLs).then(function(results) {
                            var today = new Date();
                            self.newCard.dateCreated = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
                            listRef.child(list['.key']).child('cards').once('value', function(snapshot) {
                                self.newCard.id = snapshot.numChildren();
                            });
                            self.newCard.images = results;
                            self.newCard.name = name;
                            self.newCard.description = description;
                            self.newCard.deadline = deadline;
                            self.newCard.categories = categories;
                            self.newCard.todos = todos;
                            
                            // reset
                            listRef.child(list['.key']).child('cards').push(self.newCard);
                            $('#add-modal').get(0).reset();
                            $('.added-tasks').remove();
                            self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true, users: [], comments: []};
                        });

                    } else {        // no images, then just push card
                        listRef.child(list['.key']).child('cards').push(self.newCard);
                    }
                }
                
                // reset
                $('#add-modal').get(0).reset();
                $('.added-tasks').remove();
                self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true, users: [], comments: []};
            });
        },
        
        // add task for a new card
        // No Firebase
        addTask: function () {
            var self = this;

            // push task into todos
            self.newCard.todos.push($('#add-task').val());

            // add task and clear input value
            var newTask = $('<li class="added-tasks">' + $('#add-task').val() + '</li>');
            newTask.css('color', 'darkgray');
            newTask.css('margin-top', '5px');
            $('ul').append(newTask);
            $('#add-task').val('');
        },
        
        // show card info in modal
        // Firebase: DONE
        showCard: function (list, index) {
            var self = this;

            // load modal
            var modal = $('#show-modal');
            modal.css('display', 'block');

            // clear all divs that are appended to
            $('.close').off('click');
            $('.close').click(function () {
                $('#show-checklist').empty();
                $('#show-images').empty();
                $('#show-users').empty();
                $('#show-comments').empty();
                modal.css('display', 'none');
            });
            
            // keep track of the length of all arrays
            var numTodos = 0;
            var numUsers = 0;
            var numComments = 0;
            var numImages = 0;
            
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                var card = snapshot.val();

                if ('todos' in card) numTodos = card['todos'].length;
                if ('users' in card) numUsers = card['users'].length;
                if ('comments' in card) numComments = card['comments'].length;
                if ('images' in card) numImages = card['images'].length;
            
                // name + description
                $('#show-name').text(card['name']);
                $('#show-description').text(card['description']);
                
                // todos
                if (numTodos != 0) {
                    $('#show-checklist').append('<p style="color: darkgray; margin-bottom: 0;">Checklist: </p>');
                    for (var i = 0; i < numTodos; i++) {
                        var task = $('<div class="task-div"></div>');
                        task.css('display', 'flex');
                        task.css('flex-direction', 'row');
                        task.css('align-items', 'baseline');
                        task.css('margin', '0');
                        task.append($('<input style="width: 10%;" type="checkbox">'));
                        task.append($('<p style="margin-bottom: 0;">' + card['todos'][i] + '</p>'));
                        $('#show-checklist').append(task);
                    }
                }
                
                // users
                if (numUsers != 0) {
                    $('#show-users').append('<p style="color: darkgray; margin-bottom: 0;">Users: </p>');
                    for (var i = 0; i < numUsers; i++) {
                        var user = $('<ul class="user-div"></ul>');
                        user.css('margin', '0');
                        user.append($('<li style="margin-bottom: 0;">' + card['users'][i] + '</li>'));
                        $('#show-users').append(user);
                    }
                }
                
                // comments
                if (numComments != 0) {
                    $('#show-comments').append('<p style="color: darkgray; margin-bottom: 0;">Comments: </p>');
                    for (var i = 0; i < numComments; i++) {
                        var comment = $('<ul class="comment-div"></ul>');
                        comment.css('margin', '0');
                        comment.append($('<li style="margin-bottom: 0;">' + card['comments'][i]['name'] + ': ' + card['comments'][i]['comment'] + '</li>'));
                        $('#show-comments').append(comment);
                    }
                }

                // images
                if (numImages != 0) {
                    for (var i = 0; i < numImages; i++) {
                        console.log(card['images'][i]);
                        var image = $('<img src=' + card['images'][i] + ' >');
                        image.css('width', '20px');
                        image.css('height', '35px');
                        $('#show-images').append(image)
                    }
                }
                
                // deadline + date created
                $('#show-deadline').text('Deadline: ' + card['deadline']);
                $('#show-datecreated').text('Date Created: ' + card['dateCreated']);
            });
        },
        
        // delete specific card from list
        // Firebase: DONE
        deleteCard: function (list, index) {
            // only event triggered is this one
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            var i = 0;

            // remove card
            listRef.child(list['.key']).child('cards').child(index).remove();

            // reorder indices
            var cardList = listRef.child(list['.key']).child('cards');
            cardList.once('value', function(snapshot) {
                for (var key in snapshot.val()) {
                    cardList.child(key).update({'id': i});
                    i = i + 1;
                }
            });
            
        },
        
        // add list
        // Firebase: DONE
        addList: function () {
            var self = this;     
            self.newList.name = self.newList.name.trim();
            
            if (self.newList.name) {
                listRef.once('value', function(snapshot) {
                    self.newList.id = snapshot.numChildren();
                });
                listRef.push(self.newList);
            }

            // reset
            $('#list-input').val("");
            self.newList = {name: '', cards: [], id: null};
                
        },
        
        // add user (sign up)
        // Firebase: DONE
        addUser: function () { 
            var self = this;

            // load modal
            var modal = $('#add-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            // once save is clicked
            $('#save-user').off('click');
            $('#save-user').click(function () {
                modal.css('display', 'none');

                var name = self.newUser.name.trim();
                var email = self.newUser.email.trim();
                var id = null;

                // only valid if entered both name and email
                if (self.newUser.name && self.newUser.email) {
                    // get id
                    userRef.once('value', function(snapshot) {
                        id = snapshot.numChildren();
                        self.newUser.id = snapshot.numChildren();
                    });
                    
                    var image = document.getElementById('user-files');
                    if (image.files.length > 0) {
                        var file = image.files[0];
                        storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                            self.newUser.image = snapshot.downloadURL;
                            self.newUser.name = name;
                            self.newUser.email = email;
                            self.newUser.id = id;
                            userRef.push(self.newUser);
                        });
                    } else {
                        userRef.push(self.newUser);
                    }
                } else {    // did not enter both name and email
                    alert('Please enter both fields!');
                }
                
                // reset
                $('#add-user-modal').get(0).reset();
                self.newUser = {name: '', email: '', image: '', id: null, status: false};
            });
        },
        
        // check if user is already in system (log in)
        // Firebase: DONE
        checkUser: function () {
            var self = this;

            // load modal
            var modal = $('#sign-in-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            // once clicked on sign-in
            $('#sign-in').off('click');
            $('#sign-in').click(function () {
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();

                if (self.newUser.name && self.newUser.email) {

                    // get key in firebase for user signing in
                    userRef.once('value', function(snapshot) {
                        for (var key in snapshot.val()) {
                            userRef.child(key).once('value', function(snapshot) {
                                // console.log(snapshot.val());
                                var name = snapshot.val()['name'];
                                var email = snapshot.val()['email'];
                                if (self.newUser.name == name && self.newUser.email == email) {
                                    self.userKey = key;
                                    // console.log(self.userKey);
                                }
                            });
                        }
                    });
                    
                    // if key is not found
                    if (self.userKey == '') {
                        var error = $('<p id="error">User not found. Please sign up!</p>');
                        error.css('text-align', 'center');
                        error.css('color', 'darkgray');
                        error.css('font-weight', 'bold');
                        $('#sign-in').replaceWith(error);
                        
                        // reset with sign-in button
                        $('.close').off('click');
                        $('.close').click(function () {
                            $('#error').replaceWith($('<p id="sign-in" class="save">Sign in</p>'))
                            modal.css('display', 'none');
                        });
                    } else {    // if key is found
                        modal.css('display', 'none');

                        $('#log-in').css('display', 'none');
                        $('#sign-up').css('display', 'none');
                        $('#change-info').css('display', 'block');
                        $('#log-out').css('display', 'block');

                        // update who is logged in 
                        userRef.child(self.userKey).once('value', function(snapshot) {
                            userRef.child(self.userKey).update({'status': true});
                            userRef.update({'logged': self.userKey});

                            // if there's an image
                            if (snapshot.val()['images'] != '') {
                                var image = $('<img id="user-header-image" src=' + snapshot.val()['image'] + ' >')
                                image.css('height', '50px');
                                image.css('width', '35px');
                                image.css('border-radius', '10%');
                                $('#user-header').append(image); 
                            }
                        });
                    }
                } else {    // did not enter for both
                    alert('Please enter for both fields!');
                }
                
                // reset modal
                $('#sign-in-modal').get(0).reset();
                self.newUser = {name: '', email: '', image: '', id: null, status: false};
            });
        },
        
        // change user profile
        // Firebase: DONE
        changeUserInfo: function () {
            var self = this;

            // load modal
            var modal = $('#change-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            // if save
            $('#save-changes').off('click');
            $('#save-changes').click(function () {
                modal.css('display', 'none');

                userRef.once('value', function(snapshot) {
                    self.userKey = snapshot.val().logged;
                });

                var newName = $('#new-username').val();
                var newEmail = $('#new-email').val();
                
                var image = document.getElementById('user-change-files');

                // if there are images uploaded
                if (image.files.length > 0) {
                    var file = image.files[0];
                    console.log(file);
                    storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                        userRef.child(self.userKey).update({'image': snapshot.downloadURL});
                        $('#user-header-image').remove();
                        var image = $('<img id="user-header-image" src=' + snapshot.downloadURL + ' >')
                        image.css('height', '50px');
                        image.css('width', '35px');
                        image.css('border-radius', '10%');
                        $('#user-header').append(image);    
                    });
                }

                // update name/email if entered in something
                if (newName) userRef.child(self.userKey).update({'name': newName});
                if (newEmail) userRef.child(self.userKey).update({'email': newEmail});
                
                // reset modal
                modal.get(0).reset();
            });
        },
        
        // delete list
        // Firebase: DONE
        deleteList: function (list) {
            // remove list
            listRef.child(list['.key']).remove();
            
            // reorder list
            var i = 0;
            listRef.once('value', function(snapshot) {
                for (var key in snapshot.val()) {
                    listRef.child(key).update({'id': i});
                    i = i + 1;
                }
            });
            
        },
        
        // edit card name
        // Firebase: DONE
        editCardName: function (list, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

            // load modal
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            // once click save
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                listRef.child(list['.key']).child('cards').child(index).update({'name': self.newName});
                self.newName = '';
            });
            
        },
        
        // edit list name
        // Firebase: DONE
        editListName: function (list) {
            var self = this;

            // load modal
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });

            // once click save
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                listRef.child(list['.key']).update({'name': self.newName});
                self.newName = '';
            });
            
        }, 
        
        // collapse list (don't show cards)
        // No Firebase
        collapseList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'none');
        },
        
        // expand list (show cards)
        // No Firebase
        expandList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'block');
        },
        
        // choose background color
        // Firebase: DONE
        chooseBackgroundColor: function () {
            $('#app').css('background-image', 'none');
            $('#app').css('background-color', $('#background-color').val());
            backgroundRef.update({'name': $('#background-color').val()});
            $('#background-color').val('');
        },
        
        // choose background image
        // Firebase: DONE
        chooseBackgroundImage: function () {
            var image = document.getElementById('background-file');
            
            if (image.files.length > 0) {
                var file = image.files[0];
                storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                    $('#app').css('background-image', 'url("' + snapshot.downloadURL + '")');
                    backgroundRef.update({'name': snapshot.downloadURL});
                });
            }
        },
        
        // filter cards by date 
        // to get all the cards again, just type in a future date
        // Firebase: DONE
        filterByDate: function () {
            var self = this;
            var dateInput = $('#filter-date').val();
            var x = dateInput.split('-');
            var enteredDate = new Date(x[2], x[0]-1, x[1]);
            $('.card').css('background-color', 'white');
            
            listRef.once('value', function(listSnapshot) {
                listSnapshot.forEach(function(listSnapshot) {
                    listSnapshot.child('cards').forEach(function(cardSnapshot) {
                        var card = cardSnapshot.val();
                        var y = card['dateCreated'].split('-');
                        var date = new Date(y[2], y[0]-1, y[1]);
                        if (date > enteredDate) {
                            cardSnapshot.ref.update({'show': false});
                        } else {
                            cardSnapshot.ref.update({'show': true});
                        }
                    });                        
                });
            });
            
            $('#filter-date').val('');
        },
    
        // filter cards by category 
        // Firebase: DONE
        filterByColor: function (category) {
            var self = this;
            var categoryColor = '';
            categoryRef.once('value', function(snapshot) {
                categoryColor = snapshot.val()[category['.key']]['color'];
            });
            
            listRef.once('value', function(listSnapshot) {
                listSnapshot.forEach(function(listSnapshot) {
                    listSnapshot.child('cards').forEach(function(cardSnapshot) {
                        var card = cardSnapshot.val();
                        if (self.clicked == 1) {
                            cardSnapshot.ref.update({'show': true});
                        } else {
                            if (!card['categories']) {
                                cardSnapshot.ref.update({'show': false});
                            }
                            else if (card['categories'].indexOf(categoryColor) < 0) {
                                cardSnapshot.ref.update({'show': false});
                            }
                        }
                    });                        
                });
            });
            
            if (self.clicked == 1) {
                self.clicked = 0;
            } else {
                self.clicked = 1;
            }
            
        },
        
        // add category + choose its color
        // Firebase: DONE
        addCategory: function () {
            var self = this;
            
            // load modal
            var modal = $('#category-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-category').off('click');
            $('#save-category').click(function () {
                modal.css('display', 'none');
                categoryRef.push(self.newCategory);

                // reset 
                modal.get(0).reset();
                self.newCategory = {name: '', color: ''};
            });
            
        }, 
        
        // Firebase: DONE
        moveListLeft: function (list, index) {
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch

            // store current target
            listRef.child(list['.key']).once('value', function(snapshot) {
                prev = snapshot.val();
                prev.id = index-1;
                if (!prev.cards) prev.cards = {};
            });
            
            // switch
            listRef.once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(key).once('value', function(snapshot2) {
                        var id = snapshot2.val().id;
                        if (id == index-1) {
                            next = snapshot2.val();
                            next.id = index;
                            if (!next.cards) next.cards = {};
                            listRef.child(key).update(prev);
                        } else if (id == index) {
                            listRef.child(key).update(next);
                        }
                    });
                }
            });
        },
        
        // Firebase: DONE
        moveListRight: function (list, index) {
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch
            
            // store target that is indexed 1 after
            listRef.once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(key).once('value', function(snapshot2) {
                        // console.log(snapshot2.val());
                        if (snapshot2.val().id == index+1) {
                            prev = snapshot2.val();
                            prev.id = index;
                            if (!prev.cards) prev.cards = {};
                        }
                    });
                }
            });
            
            // switch
            listRef.once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(key).once('value', function(snapshot2) {
                        if (snapshot2.val().id == index) {
                            next = snapshot2.val();
                            next.id = index+1;
                            if (!next.cards) next.cards = {};
                            // console.log(next);
                            listRef.child(key).update(prev);
                        } else if (snapshot2.val().id == index+1) {
                            listRef.child(key).update(next);
                        }
                    });
                }
            });
            
        },
        
        // Firebase: DONE
        moveCardUp: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch
            
            // get current target
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                prev = snapshot.val();
                prev.id = snapshot.val().id-1;
                if (!prev.categories) prev.categories = [];
                if (!prev.images) prev.images = [];
                if (!prev.todos) prev.todos = [];
                if (!prev.comments) prev.comments = [];
                if (!prev.users) prev.users = [];
            });
            
            // switch
            listRef.child(list['.key']).child('cards').once('value', function(snapshot1) {
               for (var key in snapshot1.val()) {
                   listRef.child(list['.key']).child('cards').child(key).once('value', function(snapshot2) {
                       if (snapshot2.val().id == prev.id) {
                           next = snapshot2.val();
                           next.id = prev.id + 1;
                           if (!next.categories) next.categories = [];
                           if (!next.images) next.images = [];
                           if (!next.todos) next.todos = [];
                           if (!next.comments) next.comments = [];
                           if (!next.users) next.users = [];
                           listRef.child(list['.key']).child('cards').child(key).update(prev);
                       } else if (snapshot2.val().id == (prev.id+1)) {
                           listRef.child(list['.key']).child('cards').child(key).update(next);
                       }
                   });
               } 
            });
        },
        
        // Firebase: ongoing
        moveCardDown: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            // get index of next card
            var nextID = null;
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                nextID = snapshot.val().id + 1;
            });
            
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch
            
            // get that card and store
            listRef.child(list['.key']).child('cards').once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(list['.key']).child('cards').child(key).once('value', function(snapshot2) {
                        if (snapshot2.val().id == nextID) {
                            prev = snapshot2.val();
                            prev.id = nextID-1;
                            if (!prev.categories) prev.categories = [];
                            if (!prev.images) prev.images = [];
                            if (!prev.todos) prev.todos = [];
                            if (!prev.comments) prev.comments = [];
                            if (!prev.users) prev.users = [];
                        }
                    });
                }
            });
            
            // switch
            listRef.child(list['.key']).child('cards').once('value', function(snapshot1) {
               for (var key in snapshot1.val()) {
                   listRef.child(list['.key']).child('cards').child(key).once('value', function(snapshot2) {
                       // console.log(snapshot2.val());
                       if (snapshot2.val().id == (nextID-1)) {
                           // console.log(prev.id);
                           // console.log(snapshot2.val());
                           next = snapshot2.val();
                           next.id = nextID;
                           if (!next.categories) next.categories = [];
                           if (!next.images) next.images = [];
                           if (!next.todos) next.todos = [];
                           if (!next.comments) next.comments = [];
                           if (!next.users) next.users = [];
                           listRef.child(list['.key']).child('cards').child(key).update(prev);
                       } else if (snapshot2.val().id == nextID) {
                           listRef.child(list['.key']).child('cards').child(key).update(next);
                       }
                   });
               } 
            });
            
        },
        
        moveCardAcross: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            // load modal
            var self = this;
            var modal = $('#move-lists-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            var foundList = false;
            var modifiedCard = card;
            var newListRef = null;
            
            // once click save
            $('#save-list').off('click');
            $('#save-list').click(function () {
                modal.css('display', 'none');
                
                // switch 
                listRef.once('value', function(snapshot1) {
                    for (var key in snapshot1.val()) {
                        listRef.child(key).once('value', function(snapshot2) {
                            if (snapshot2.val().name == self.listTo) {
                                foundList = true;
                                listRef.child(key).child('cards').push(card);
                                newListRef = listRef.child(key).child('cards');
                            }
                        });
                    }
                });

                // reorder the new list's cards
                var i = 0;
                newListRef.once('value', function(snapshot) {
                    for (var key in snapshot.val()) {
                        newListRef.child(key).update({'id': i});
                        i = i + 1;
                    }
                });
                
                // delete card from original list
                if (foundList) {
                    self.deleteCard(list, index);
                }

                // reset
                $('#move-lists-modal').get(0).reset();
                self.listTo = '';
            });
        },
        
        // log out current user
        logOut: function () {
            // get user key of whoever is logged in
            var userKey = null;
            userRef.once('value', function(snapshot) {
                userKey = snapshot.val().logged;
            });

            // update statuses
            userRef.child(userKey).update({'status': false});
            userRef.update({'logged': ''});

            $('#change-info').css('display', 'none');
            $('#log-out').css('display', 'none');
            $('#user-header-image').remove();
            $('#log-in').css('display', 'block');
            $('#sign-up').css('display', 'block');
            
        },
        
        // add comment onto card
        addComment: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            // load modal
            var self = this;
            var modal = $('#comment-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            var userKey = null;
            var name = '';
            
            $('#save-comment').off('click');
            $('#save-comment').click(function () {
                modal.css('display', 'none');
                userRef.once('value', function(snapshot) {
                    if (snapshot.val().logged == '') {
                        alert('Not logged in! Please log in first before adding yourself to card.');
                    } else {
                        userKey = snapshot.val().logged;
                        userRef.child(userKey).once('value', function(snapshot) {
                            name = snapshot.val().name;  
                        });

                        var newComments = [];
                        var newDict = {};

                        var cardRef = listRef.child(list['.key']).child('cards').child(index);
                        cardRef.once('value', function(snapshot) {
                            // console.log(snapshot.val());
                            if ('comments' in snapshot.val()) {
                                newComments = snapshot.val().comments;
                                newComments.push({'name': name, 'comment': self.newComment});
                                // console.log('wrong');
                            } else {
                                newComments = [{'name': name, 'comment': self.newComment}];
                                // console.log('right');
                            }
                            // console.log(newComments);
                            newDict = snapshot.val();
                            newDict.comments = newComments;
                            // console.log(newDict);
                            cardRef.update(newDict);
                        });
                    }
                });

                $('#comment-modal').get(0).reset();
                self.newComment = '';
            });
            
        },
        
        // add user onto card
        addUserToCard: function(list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            var userKey = null;
            var name = '';
            
            userRef.once('value', function(snapshot) {
                if (snapshot.val().logged == '') {
                    alert('Not logged in! Please log in first before adding yourself to card.');
                } else {
                    userKey = snapshot.val().logged;
                }
            });
            
            userRef.child(userKey).once('value', function(snapshot) {
                name = snapshot.val().name;  
            });
            
            var newUsers = [];
            var newDict = {};
            
            var cardRef = listRef.child(list['.key']).child('cards').child(index);
            cardRef.once('value', function(snapshot) {
                // console.log(snapshot.val());
                if ('users' in snapshot.val()) {
                    newUsers = snapshot.val().users;
                    newUsers.push(name);
                } else {
                    newUsers = [name];
                }
                newDict = snapshot.val();
                newDict.users = newUsers;
                cardRef.update(newDict);
            });
            
        }
        
    }
});
