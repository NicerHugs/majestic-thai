(function() {
    'use strict';

    window.App = {};

//==============================================================================
                                  //Views
//==============================================================================

    App.BaseView = Backbone.View.extend({
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container || $('main');
            this.$template = options.$template;
            this.render();
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change', this.render);
        },
        template: function() {
            return _.template(this.$template.text());
        },
    });

//Single item view on the menu's view
    App.MenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
        template: _.template($('#menu-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });

//Single item view on the orderable menu
    App.OrderMenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
        template: _.template($('#order-menu-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        },
        events: {
            'click h3': 'selectItemOptions'
        },
        selectItemOptions: function(e) {
            e.preventDefault();
            var itemOptions = new App.OrderItemOptionsView({
                collection: this.collection,
                model: this.model
            });
        }
    });

//An individual menu item's options, used to get user's desired options when
//user tries to add the item to their order
    App.OrderItemOptionsView = App.BaseView.extend({
        className: 'order-item-options',
        template: _.template($('#order-item-options-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
            this.renderOptions();
            $('body').addClass('background');
        },
        events: {
            'click .cancel-item' : 'cancelItemAdd',
            'submit'             : 'addItem'
        },
        addItem: function(e) {
            e.preventDefault();
            var itemOptions = {
                name: this.model.get('name'),
                customize: $('textarea').val() || 'none',
                spice: $('input[name=spice]:checked').val() || 'medium',
                meat: $('input[name=meat]:checked').val() || 'none',
                vegan: $('input[name=vegan]:checked').val() ? 'yes' : 'no'
            };
            this.collection.add(itemOptions);
            $('body').removeClass('background');
            this.remove();
        },
        cancelItemAdd: function(e) {
            e.preventDefault();
            $('body').removeClass('background');
            this.remove();
        },
        renderOptions: function() {
            if (this.model.get('vegan')) {
                var veganOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#vegan-option-template')
                });
            }
            if (this.model.get('spice')) {
                var spiceOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#spice-option-template')
                });
            }
            if (this.model.get('meat')) {
                var meatOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#meat-option-template')
                });
            }
        }
    });

//the options views for each of an item's available options (inserted into
//item-options view)
    App.ItemOptionView = App.BaseView.extend({
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container;
            this.$template = options.$template;
            this.render();
        },
        render: function() {
            this.$container.prepend(this.template(this.model));
        }
    });

//Any reference to the entire menu's view
    App.MenuView = App.BaseView.extend({
        tagName: 'section',
        className: 'menu',
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container || $('main');
            this.$template = options.$template;
            this.render();
        },
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
        },
        events: {
            'click h2 a'          : 'expandMenu',
            'click button'        : 'closeMenu',
            'click .order-button' : 'startNewOrder'
        },
        expandMenu: function(e) {
            e.preventDefault();
            var that = this;
            this.$el.find('.order-button').removeClass('hidden');
            this.$el.find('button').removeClass('hidden');
            this.$el.find('ul').html('');
            _.each(this.collection.models, function(model) {
                that.renderMenuItem(model, that);});
        },
        //render a menuItemView and put it inside the ul of this view.
        renderMenuItem: function(model, parent) {
            var newItemView = new App.MenuItemView({
                model: model,
                $container: parent.$el.find('ul'),
            });
            newItemView.render();
        },
        renderOrderMenuItem: function(model, parent, orderItemsCollection) {
            var newItemView = new App.OrderMenuItemView({
                collection: orderItemsCollection,
                model: model,
                $container: parent.$el.find('ul'),
            });
            newItemView.render();
            this.orderCollection = orderItemsCollection;
        },
        //closes the expanded menu.
        closeMenu: function(e) {
            e.preventDefault();
            $(e.target).addClass('hidden');
            this.$el.find('.order-button').addClass('hidden');
            this.$el.find('ul').html('');
        },
        //creates a new order and makes menu-items orderable
        startNewOrder: function(e) {
            e.preventDefault();
            var that = this;
            var newOrderItems = new App.OrderItems();
            var workingOrder = new App.WorkingOrderView({
                collection: newOrderItems,
                $container: $('main'),
                $template: $('#new-order-template'),
                parent: this
            });
            this.$el.find('ul').html('');
            _.each(this.collection.models, function(model) {
                that.renderOrderMenuItem(model, that, newOrderItems);});
        },
        openUserLogin: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: new App.User(),
                $container: this.$el,
                $template: $('#user-login-template')
            });
        }
    });

//working order view is where a working order is displayed before it is sent to
//the server
    App.WorkingOrderView = App.BaseView.extend({
        className: 'working-order',
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container;
            this.$template = options.$template;
            this.parent = options.parent;
            this.render();
            this.listenTo(this.collection, 'add', this.render);
        },
        render: function() {
            var that = this;
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
            _.each(this.collection.models, function(model) {
                that.renderOrderItem(model, that);});
        },
        renderOrderItem: function(model) {
            var newOrderItem = new App.OrderItemView({
                model: model,
                $container: this.$el.find('ul'),
            });
            newOrderItem.render();
        },
        events: {
            'click a'                     : 'closeOrderView',
            'click .confirm-order-button' : 'openOrderConfirmation'
        },
        openOrderConfirmation: function(e) {
            e.preventDefault();
            new App.ConfirmOrderView({
                collection: this.collection,
                $container: $('main'),
                $template: $('#order-confirmation-template'),
                parent: this
            });
        },
        closeOrderView: function(e) {
            e.preventDefault();
            this.parent.expandMenu(e);
            this.remove();
        }
    });

//The view for an individual item in a working order
    App.OrderItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
        template: _.template($('#working-order-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });

//confirm order view is a popup that shows the user their complete working order
//with all details so they can review before placing order. it is responsible for
//saving the order to the server.
    App.ConfirmOrderView = App.BaseView.extend({
        className: 'confirm-order',
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container;
            this.$template = options.$template;
            this.parent = options.parent;
            this.render();
            this.listenTo(this.collection, 'destroy change', this.render);
        },
        render: function() {
            var that = this;
            $('body').addClass('background');
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
            _.each(this.collection.models, function(model) {
                that.renderOrderItem(model, that);});
        },
        renderOrderItem: function(model) {
            var newOrderItem = new App.ConfirmOrderItemView({
                model: model,
                $container: this.$el.find('ul'),
            });
            newOrderItem.render();
        },
        events: {
            'click .cancel-confirm' : 'cancelConfirmation',
            'submit'                : 'submitOrder'
        },
        cancelConfirmation: function(e) {
            e.preventDefault();
            $('body').removeClass('background');
            this.remove();
        },
        submitOrder: function(e) {
            e.preventDefault();
            var onlineOrder = {items: []};
            _.each(this.collection.models, function(model) {
                onlineOrder.items.push(model.attributes);
            });
            var onlineCollection = new App.Orders();
            onlineCollection.add(onlineOrder);
            this.parent.remove();
            this.remove();

            $('body').removeClass('background');
        }
    });

//confirmOrderItemView is the view that represents an individual order item
//in the final confirmation screen of an order
    App.ConfirmOrderItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'order-item',
        template: _.template($('#confirm-order-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });

//user login (popup) view
    App.UserLoginView = App.BaseView.extend({
        className: 'user-login',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model));
        },
        events: {
            'click .cancel-login'   : 'cancelLogin',
            'click #new-user-login' : 'openNewUserForm'
        },
        cancelLogin: function(e) {
            e.preventDefault();
            this.remove();
        },
        openNewUserForm: function(e) {
            e.preventDefault();
            new App.NewUserView({
                model: this.model,
                $container: this.$el.parent(),
                $template: $('#new-user-template')
            });
            this.remove();
        }
    });

//new user login (create acct)
    App.NewUserView = App.BaseView.extend({
        className: 'user-login',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model));
        },
        events: {
            'click .cancel-login'               : 'cancelAcctCreation',
            'keyup #new-user-password-validate' : 'validatePassword',
            'submit'                            : 'makeNewUser'
        },
        cancelAcctCreation: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: this.model,
                $container: this.$el.parent(),
                $template: $('#user-login-template')
            });
            this.remove();
        },
        validatePassword: function(e) {
            if ($('#new-user-password').val() !== $('#new-user-password-validate').val()) {
                $('#new-user-password-validate').addClass('invalid');
                return false;
            }
            else {
                $('#new-user-password-validate').removeClass('invalid');
                return true;
            }
        },
        makeNewUser: function(e) {
            e.preventDefault();
            if (this.validatePassword()) {
                var users = new App.Users();
                var newUser = users.create({
                    name: $('#new-user-name').val(),
                    address: $('#new-user-addr').val(),
                    zipcode: $('#new-user-zip').val(),
                    email: $('#new-user-email').val(),
                    phone: $('#new-user-phone').val(),
                    password: $('#new-user-password').val()
                });
                console.log(users.get(newUser.id));
            }
        }
    });

//homepage contact/loctation information's view
    App.InfoView = App.BaseView.extend({
        tagName: 'section',
        className: 'info',
        template: _.template($('#homepage-info-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });


//==============================================================================
                                  //Models
//==============================================================================

//Any single menu item
    App.MenuItem = Backbone.Model.extend({

    });

//All contact and location information about the restaurant
    App.Info = Backbone.Model.extend({
        defaults: {
            weekdayHrs: '12-9pm',
            weekendHrs: '12pm-1am',
            sundayHrs: '10am-9pm'
        }
    });

//A single user
    App.User = Backbone.Model.extend({
        defaults: {
        }
    });

//A single order
    App.Order = Backbone.Model.extend({

    });

//A single order item
    App.OrderItem = Backbone.Model.extend({

    });


//==============================================================================
                                  //Collections
//==============================================================================

//The collection of menu-item models
    App.Menu = Backbone.Firebase.Collection.extend({
        model: App.MenuItem,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/menuItems"
    });

//The collection of users
    App.Users = Backbone.Firebase.Collection.extend({
        model: App.User,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/users"
    });

//The collections of orders
    App.Orders = Backbone.Firebase.Collection.extend({
        model: App.Order,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/orders",
    });

//A collection of items in a working order
    App.OrderItems = Backbone.Collection.extend({
        model: App.OrderItem
    });

//==============================================================================
                                  //Glue
//==============================================================================

    $(document).ready(function() {
        var menu = new App.Menu();
        var homeMenuView = new App.MenuView({
            collection: menu,
            $template: $('#homepage-menu-template')
        });
        var info = new App.Info({
        });
        var homeInfoView = new App.InfoView({
            model: info,
            $template: $('#homepage-info-template')
        });
    });

})();
















//
