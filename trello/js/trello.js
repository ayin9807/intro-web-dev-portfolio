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
            var modal = $('#add-modal');
            modal.css('display', 'block');
            // var list = parseInt(event.target.parentElement.parentElement.getAttribute('id'));
            
            // console.log(list);
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');
                var name = self.newCard.name.trim();
                var description = self.newCard.description.trim();
                var deadline = self.newCard.deadline.trim();
                var categories = self.newCard.categories;
                var todos = self.newCard.todos;
                // self.newCard.id = listRef.length;
                if (self.newCard.name) {
                    var images = document.getElementById('card-files');
                    // console.log(images.files);
                    if (images.files.length > 0) {
                        var file = images.files;
                        // console.log(file);
                        var allURLs = [];
                        for (var i = 0; i < file.length; i++) {
                            // console.log(file[i]);
                            allURLs.push(self.getURLPromise(file[i]));
                        }
                        
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
                            // console.log(self.newCard.images);
                            listRef.child(list['.key']).child('cards').push(self.newCard);

                        });
                    }
                }
                
                // console.log(self.newCard.categories);
                
                $('#add-modal').get(0).reset();
                $('.added-tasks').remove();
                self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true, users: [], comments: []};
            });
        },
        
        // add task for a new card
        // No Firebase
        addTask: function () {
            var self = this;
            self.newCard.todos.push($('#add-task').val());
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
            var modal = $('#show-modal');
            modal.css('display', 'block');
            // var card = parseInt(event.currentTarget.getAttribute('id'));
            // var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));

            $('.close').off('click');
            $('.close').click(function () {
                $('#show-checklist').empty();
                $('#show-images').empty();
                $('#show-users').empty();
                $('#show-comments').empty();
                modal.css('display', 'none');
            });
            
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
                // console.log(numUsers);
                // console.log(numComments)
                
                $('#show-name').text(card['name']);
                $('#show-description').text(card['description']);
                // why does || not work??????
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
                
                if (numUsers != 0) {
                    $('#show-users').append('<p style="color: darkgray; margin-bottom: 0;">Users: </p>');
                    for (var i = 0; i < numUsers; i++) {
                        var user = $('<ul class="user-div"></ul>');
                        user.css('margin', '0');
                        user.append($('<li style="margin-bottom: 0;">' + card['users'][i] + '</li>'));
                        $('#show-users').append(user);
                    }
                }
                
                // console.log(numComments);
                if (numComments != 0) {
                    $('#show-comments').append('<p style="color: darkgray; margin-bottom: 0;">Comments: </p>');
                    for (var i = 0; i < numComments; i++) {
                        var comment = $('<ul class="comment-div"></ul>');
                        comment.css('margin', '0');
                        comment.append($('<li style="margin-bottom: 0;">' + card['comments'][i]['name'] + ': ' + card['comments'][i]['comment'] + '</li>'));
                        $('#show-comments').append(comment);
                    }
                }

                console.log(numImages);
                if (numImages != 0) {
                    for (var i = 0; i < numImages; i++) {
                        console.log(card['images'][i]);
                        var image = $('<img src=' + card['images'][i] + ' >');
                        image.css('width', '20px');
                        image.css('height', '35px');
                        $('#show-images').append(image)
                    }
                }
                
                $('#show-deadline').text('Deadline: ' + card['deadline']);
                $('#show-datecreated').text('Date Created: ' + card['dateCreated']);
            });
        },
        
        // delete specific card from list
        // Firebase: DONE
        deleteCard: function (list, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            // var self = this;
            // var card = event.target.parentElement.parentElement.getAttribute('id');
            // var list = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('id');
            
            var i = 0;
            listRef.child(list['.key']).child('cards').child(index).remove();
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
            // self.newList.id = self.listData.length;
            
            if (self.newList.name) {
                listRef.once('value', function(snapshot) {
                    self.newList.id = snapshot.numChildren();
                    console.log(self.newList.id);
                });
                listRef.push(self.newList);
            }
            $('#list-input').val("");
            self.newList = {name: '', cards: [], id: null};
                
        },
        
        // add user (sign up)
        // Firebase: DONE
        addUser: function () { 
            var self = this;
            var modal = $('#add-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-user').off('click');
            $('#save-user').click(function () {
                modal.css('display', 'none');
                var name = self.newUser.name.trim();
                var email = self.newUser.email.trim();
                var id = null;
                // self.newUser.id = self.userData.length;
                if (self.newUser.name && self.newUser.email) {
                    userRef.once('value', function(snapshot) {
                        id = snapshot.numChildren();
                    });
                    
                    var image = document.getElementById('user-files');
                    // console.log(image.files);
                    if (image.files.length > 0) {
                        var file = image.files[0];
                        console.log(file);
                        storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                            self.newUser.image = snapshot.downloadURL;
                            self.newUser.name = name;
                            self.newUser.email = email;
                            self.newUser.id = id;
                            userRef.push(self.newUser);
                        });
                        // console.log(url);
                    }
                    // self.userData.push(self.newUser);
                }
                
                // why does it still appear??
                $('#add-user-modal').get(0).reset();
                self.newUser = {name: '', email: '', image: '', id: null, status: false};
            });
        },
        
        // check if user is already in system (log in)
        // Firebase: DONE
        checkUser: function () {
            var self = this;
            var modal = $('#sign-in-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#sign-in').off('click');
            $('#sign-in').click(function () {
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();
                if (self.newUser.name && self.newUser.email) {
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
                    
                    if (self.userKey == '') {
                        var error = $('<p id="error">User not found. Please sign up!</p>');
                        error.css('text-align', 'center');
                        error.css('color', 'darkgray');
                        error.css('font-weight', 'bold');
                        $('#sign-in').replaceWith(error);
                        
                        $('.close').off('click');
                        $('.close').click(function () {
                            $('#error').replaceWith($('<p id="sign-in" class="save">Sign in</p>'))
                            modal.css('display', 'none');
                        });
                    } else {
                        modal.css('display', 'none');
                        $('#log-in').css('display', 'none');
                        $('#sign-up').css('display', 'none');
                        $('#change-info').css('display', 'block');
                        $('#log-out').css('display', 'block');
                        userRef.child(self.userKey).once('value', function(snapshot) {
                            userRef.child(self.userKey).update({'status': true});
                            userRef.update({'logged': self.userKey});
                            var image = $('<img id="user-header-image" src=' + snapshot.val()['image'] + ' >')
                            image.css('height', '50px');
                            image.css('width', '35px');
                            image.css('border-radius', '10%');
                            $('#user-header').append(image); 
                        });
                    }
                } 
                
                $('#sign-in-modal').get(0).reset();
                self.newUser = {name: '', email: '', image: '', id: null, status: false};
            });
        },
        
        // change user profile
        // Firebase: DONE
        changeUserInfo: function () {
            var self = this;
            var modal = $('#change-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-changes').off('click');
            $('#save-changes').click(function () {
                modal.css('display', 'none');

                userRef.once('value', function(snapshot) {
                    self.userKey = snapshot.val().logged;
                });

                var newName = $('#new-username').val();
                var newEmail = $('#new-email').val();
                // self.userData[self.userIndex].name = newName;
                // self.userData[self.userIndex].email = newEmail;
                var image = document.getElementById('user-change-files');

                // console.log(image.files);
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
                    // console.log(url);
                }


                
                if (newName) userRef.child(self.userKey).update({'name': newName});
                
                if (newEmail) userRef.child(self.userKey).update({'email': newEmail});
                
                modal.get(0).reset();
            });
        },
        
        // delete list
        // Firebase: DONE
        deleteList: function (list) {
            // var self = this;
            // var list = event.target.parentElement.parentElement.getAttribute('id');
            // console.log(list);
            // self.listData.splice(list, 1);
            listRef.child(list['.key']).remove();
            
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
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            // var card = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            // var list = parseInt(event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('id'));
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                // var newName = $('#new-name').val();
                // self.listData[list].cards[card].name = newName;
                listRef.child(list['.key']).child('cards').child(index).update({'name': self.newName});
                self.newName = '';
            });
            
        },
        
        // edit list name
        // Firebase: DONE
        editListName: function (list) {
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            // var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                // var newName = $('#new-name').val();
                // self.listData[list].name = newName;
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
            // console.log($('#background-image').val());
            
            var image = document.getElementById('background-file');
            // console.log(image.files);
            if (image.files.length > 0) {
                var file = image.files[0];
                console.log(file);
                storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                    $('#app').css('background-image', 'url("' + snapshot.downloadURL + '")');
                    backgroundRef.update({'name': snapshot.downloadURL});
                });
                // console.log(url);
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
                        // console.log(cardSnapshot.val());
                        var card = cardSnapshot.val();
                        var y = card['dateCreated'].split('-');
                        var date = new Date(y[2], y[0]-1, y[1]);
                        if (date > enteredDate) {
                            cardSnapshot.ref.update({'show': false});
                        } else {
                            cardSnapshot.ref.update({'show': true});
                        }
                        // console.log(cardSnapshot.val());
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
                // console.log(snapshot.val()); 
                categoryColor = snapshot.val()[category['.key']]['color'];
                // console.log(categoryName);
            });
            
            listRef.once('value', function(listSnapshot) {
                listSnapshot.forEach(function(listSnapshot) {
                    listSnapshot.child('cards').forEach(function(cardSnapshot) {
                        // console.log(cardSnapshot.val());
                        var card = cardSnapshot.val();
                        // console.log(self.clicked);
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
            
            var modal = $('#category-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-category').off('click');
            $('#save-category').click(function () {
                modal.css('display', 'none');
                // self.categoryData.push(self.newCategory);
                categoryRef.push(self.newCategory);
                //console.log(self.categoryData);
                $('#category-modal').get(0).reset();
                self.newCategory = {name: '', color: ''};
            });
            
        }, 
        
        // still working on
        changeOrientation: function () {
            console.log('hi');
            if (self.changed == 0) {
                console.log('column');
                $('#not-header').css('flex-direction', 'column');
                $('.list').css('flex-direction', 'row');
                $('.yo').css('display', 'flex');
                $('.yo').css('flex-direction', 'row');
                $('.yo').css('align-content', 'baseline');
                self.changed = 1;
            } else {
                console.log('row');
                $('#not-header').css('flex-direction', 'row');
                $('.list').css('flex-direction', 'column');
                $('.yo').css('display', 'block');
                self.changed = 0;
            }
        },
        
        // Firebase: DONE
        moveListLeft: function (list, index) {
            // console.log(list);
            // console.log(index);
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch

            listRef.child(list['.key']).once('value', function(snapshot) {
                prev = snapshot.val();
                prev.id = index-1;
                if (!prev.cards) prev.cards = {};
            });
            
            // console.log(prev);
            
            listRef.once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(key).once('value', function(snapshot2) {
                        var id = snapshot2.val().id;
                        if (id == index-1) {
                            next = snapshot2.val();
                            next.id = index;
                            if (!next.cards) next.cards = {};
                            // console.log(next);
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
        
        // Firebase: DONE!
        moveCardUp: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            console.log(list);
            // console.log(card['.key'].id);
            console.log(index);
            
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch
            
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                // console.log(snapshot.val());
                prev = snapshot.val();
                prev.id = snapshot.val().id-1;
                if (!prev.categories) prev.categories = [];
                if (!prev.images) prev.images = [];
                if (!prev.todos) prev.todos = [];
                if (!prev.comments) prev.comments = [];
                if (!prev.users) prev.users = [];
            });
            
            // console.log(prev);
            
            listRef.child(list['.key']).child('cards').once('value', function(snapshot1) {
               for (var key in snapshot1.val()) {
                   listRef.child(list['.key']).child('cards').child(key).once('value', function(snapshot2) {
                       // console.log(snapshot2.val());
                       if (snapshot2.val().id == prev.id) {
                           // console.log(prev.id);
                           // console.log(snapshot2.val());
                           next = snapshot2.val();
                           next.id = prev.id + 1;
                           if (!next.categories) next.categories = [];
                           if (!next.images) next.images = [];
                           if (!next.todos) next.todos = [];
                           if (!next.comments) next.comments = [];
                           if (!next.users) next.users = [];
                           console.log(prev);
                           // console.log(next);
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
            // console.log(list);
            // console.log(card);
            // console.log(index);
            var nextID = null;
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                nextID = snapshot.val().id + 1;
            });
            
            console.log(nextID);
            
            var prev = null;        // prev list after switch
            var next = null;        // next list after switch
            
            listRef.child(list['.key']).child('cards').once('value', function(snapshot1) {
                for (var key in snapshot1.val()) {
                    listRef.child(list['.key']).child('cards').child(key).once('value', function(snapshot2) {
                        // console.log(snapshot2.val());
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
            
            // console.log(prev);
            
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
                           // console.log(prev);
                           // console.log(next);
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
            
            var self = this;
            var modal = $('#move-lists-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            var foundList = false;
            var modifiedCard = card;
            // console.log(modifiedCard);
            var newListRef = null;
            
            $('#save-list').off('click');
            $('#save-list').click(function () {
                modal.css('display', 'none');
                
                listRef.once('value', function(snapshot1) {
                    // console.log(snapshot.val());
                    for (var key in snapshot1.val()) {
                        listRef.child(key).once('value', function(snapshot2) {
                            if (snapshot2.val().name == self.listTo) {
                                console.log(snapshot2.val());
                                console.log(key);
                                foundList = true;
                                listRef.child(key).child('cards').push(card);
                                newListRef = listRef.child(key).child('cards');
                            }
                        });
                    }
                });
                
                console.log(newListRef);
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
                $('#move-lists-modal').get(0).reset();
                self.listTo = '';
            });
        },
        
        logOut: function () {
            var userKey = null;
            userRef.once('value', function(snapshot) {
                userKey = snapshot.val().logged;
            });
            userRef.child(userKey).update({'status': false});
            userRef.update({'logged': ''});
            $('#change-info').css('display', 'none');
            $('#log-out').css('display', 'none');
            $('#user-header-image').remove();
            $('#log-in').css('display', 'block');
            $('#sign-up').css('display', 'block');
            
        },
        
        addComment: function (list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
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
        
        addUserToCard: function(list, card, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            console.log(list);
            console.log(card);
            console.log(index);
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
                console.log(snapshot.val());
                if ('users' in snapshot.val()) {
                    newUsers = snapshot.val().users;
                    newUsers.push(name);
                    console.log('wrong');
                } else {
                    newUsers = [name];
                    console.log('right');
                }
                newDict = snapshot.val();
                newDict.users = newUsers;
                cardRef.update(newDict);
            });
            
        }
        
    }
});
