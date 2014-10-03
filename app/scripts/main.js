(function() {
    'use strict';

    window.App = {};

//==============================================================================
                                  //Views
//==============================================================================

    App.BaseView = Backbone.View.extend({
        initialize: function(options) {
            var that = this;
            options = options || {};
            this.$container = options.$container || $('main');
            this.$template = options.$template;
            this.render();
            if (this.model)
              this.listenTo(this.model, 'destroy', this.remove);
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

//Any reference to the entire menu's view
    App.MenuView = App.BaseView.extend({
        tagName: 'section',
        className: 'menu',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
        },
        events: {
            'click h2 a': 'expandMenu',
            'click button' : 'closeMenu'
        },
        //expand the menu on click by rendering all models in menu collection
        expandMenu: function(e) {
            e.preventDefault();
            var that = this;
            this.$el.find('.order-button').removeClass('hidden');
            this.$el.find('button').removeClass('hidden');
            this.$el.find('ul').html('');
            _.each(this.collection.models, function(model) {
                console.log(model);
                that.renderMenuItem(model);
            });
        },
        //render a menuItemView and put it inside the ul of this view.
        renderMenuItem: function(model) {
            var newItemView = new App.MenuItemView({
                model: model,
                $container: this.$el.find('ul'),
                $template: $('#menu-item-template')
            });
            newItemView.render();
        },
        //closes the expanded menu.
        closeMenu: function(e) {
            e.preventDefault();
            $(e.target).addClass('hidden');
            this.$el.find('.order-button').addClass('hidden');
            this.$el.find('ul').html('');
        }
    });

//Any reference to contact/loctation information's view
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



//==============================================================================
                                  //Collections
//==============================================================================

//The collection of menu-item models
    App.Menu = Backbone.Collection.extend({
        model: App.MenuItem,
    });

//==============================================================================
                                  //Glue
//==============================================================================

    $(document).ready(function() {
        var menu = new App.Menu(menuItems);
        var homeMenuView = new App.MenuView({
            collection: menu,
            $template: $('#homepage-menu-template')
        });
        var info = new App.Info({
          }
        );
        var homeInfoView = new App.InfoView({
            model: info,
            $template: $('#homepage-info-template')
        });
    });

})();
















//
