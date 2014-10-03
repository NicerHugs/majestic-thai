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
            this.$container.append(this.el);
            this.$template = options.$template;
            this.render();
        },
        template: function() {
            return _.template(this.$template.text());
        },
    });

//Single item on the menu's view
    App.MenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item'
    });

//Any reference to the entire menu's view
    App.MenuView = App.BaseView.extend({
        tagName: 'section',
        className: 'menu',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
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
