/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';
    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product',
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input.amount',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',

        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },

    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },

        cart: {
            wrapperActive: 'active',
        },
    };



    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        },
        cart: {
            defaultDeliveryFee: 20,
        },
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

    };

    class AmountWidget {
        constructor(element) {
            const thisWidget = this;

            thisWidget.getElements(element);
            thisWidget.value = settings.amountWidget.defaultValue;
            thisWidget.setValue(thisWidget.input.value);
            //add method to constructor
            thisWidget.initActions();


            // console.log('AmountWidget:', thisWidget);
            //console.log('constructor arguments:', element);
        }

        getElements(element) {
            const thisWidget = this;
            //console.log('estem w GetElement');
            thisWidget.element = element;
            thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
            thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
            thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

        }

        setValue(value) {
            const thisWidget = this;
            const newValue = parseInt(value);

            /*TODO: Add validation*/
            if (settings.amountWidget.defaultMax >= newValue && newValue >= settings.amountWidget.defaultMin && newValue != thisWidget.value) {
                thisWidget.value = newValue;
                thisWidget.announce();
            }

            thisWidget.input.value = thisWidget.value;

        }

        initActions() {
            const thisWidget = this;

            thisWidget.input.addEventListener('change', function() {
                thisWidget.setValue(thisWidget.input.value);
            });

            thisWidget.linkDecrease.addEventListener('click', function() {
                event.preventDefault();
                thisWidget.setValue(thisWidget.value - 1);
            });

            thisWidget.linkIncrease.addEventListener('click', function() {
                event.preventDefault();
                thisWidget.setValue(thisWidget.value + 1);
            });


        }


        announce() {
            const thisWidget = this;
            const event = new Event('updated');
            thisWidget.element.dispatchEvent(event);
        }
    }

    class Cart {
        constructor(element) {
            const thisCart = this;
            thisCart.products = [];
            thisCart.getElements(element);
            thisCart.initActions();
            console.log('new Cart:', thisCart);

        }

        getElements(element) {
            const thisCart = this;
            thisCart.dom = {};
            thisCart.dom.wrapper = element;
            thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);


        }

        initActions() {
            const thisCart = this;

            thisCart.dom.toggleTrigger.addEventListener('click', function() {


                thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

            });

        }
    }

    const app = {
        initMenu: function() {
            const thisApp = this;
            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }
        },

        initData: function() {
            const thisApp = this;
            thisApp.data = dataSource;
        },


        initCart: function() {
            const thisApp = this;

            const cartEelem = document.querySelector(select.containerOf.cart);
            thisApp.cart = new Cart(cartEelem);
        },

        init: function() {
            const thisApp = this;
            console.log('*** App starting ***');
            console.log('thisApp:', thisApp);
            console.log('classNames:', classNames);
            console.log('settings:', settings);
            console.log('templates:', templates);

            thisApp.initData();
            thisApp.initMenu();
            thisApp.initCart();
        },


    };

    class Product {
        constructor(id, data) {
            const thisProduct = this;
            thisProduct.id = id;
            thisProduct.data = data;
            thisProduct.renderInMenu();
            thisProduct.getElements();
            thisProduct.initAccordion();
            thisProduct.initOrderForm();
            thisProduct.initAmountWidget();
            thisProduct.processOrder();


        }
        renderInMenu() {
            const thisProduct = this;

            /*generate HTML based on template*/
            const generatedHTML = templates.menuProduct(thisProduct.data);


            /*create DOM element using utils.createElementFromHTML*/
            thisProduct.element = utils.createDOMFromHTML(generatedHTML);

            /*find menu container*/
            const menuContainer = document.querySelector(select.containerOf.menu);

            /*add element to menu*/
            menuContainer.appendChild(thisProduct.element);


        }

        getElements() {
            const thisProduct = this;
            thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
            thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
            thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
            thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
            thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
            thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
            thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

        }

        initAmountWidget() {
            const thisProduct = this;
            //console.log('Jestem w produkt initAmount Widget');
            thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

            thisProduct.amountWidgetElem.addEventListener('updated', function() {
                thisProduct.processOrder();

            });
        }

        initAccordion() {
            const thisProduct = this;
            /* find the clickable trigger (the element that should react to clicking) */

            //const clickableTrigger = thisProduct.element.querySelectorAll(select.menuProduct.clickable);
            /*document.querySelectorAll(select.menuProduct.clickable);*/

            /* START: click event listener to trigger */
            //for (let trigger of clickableTrigger) {
            thisProduct.accordionTrigger.addEventListener('click',
                function() {

                    /* prevent default action for event */
                    event.preventDefault();


                    /* toggle active class on element of thisProduct */
                    //thisProduct.element.classList.add('active');

                    /* find all active products */
                    const activeProduct = document.querySelector(select.all.menuProductsActive);
                    if (activeProduct && activeProduct != thisProduct.element) activeProduct.classList.remove('active');

                    /* toggle active class on element of thisProduct */
                    thisProduct.element.classList.toggle('active');

                    //  console.log(activeProducts);

                    /* START LOOP: for each active product
                    for (let activeProduct of activeProducts) {

                        /* START: if the active product isn't the element of thisProduct
                        if (activeProduct != thisProduct.element) {
                            /* remove class active for the active product
                            activeProduct.classList.remove('active');

                        }

                        /* END: if the active product isn't the element of thisProduct
                }

                    /* END LOOP: for each active product */
                }
            );


            /* END: click event listener to trigger */

        };

        initOrderForm() {
            const thisProduct = this;
            //   console.log('initOrderFom');

            thisProduct.form.addEventListener('submit', function(event) {
                event.preventDefault();
                thisProduct.processOrder();

            });

            for (let input of thisProduct.formInputs) {
                input.addEventListener('change', function() {
                    thisProduct.processOrder();

                });
            }
            thisProduct.cartButton.addEventListener('click', function(event) {
                event.preventDefault();
                thisProduct.processOrder();

            });
        }


        processOrder() {
            const thisProduct = this;

            //make new variable pice
            let price = thisProduct.data.price;

            const formData = utils.serializeFormToObject(thisProduct.form);

            //start loop: for each param in params

            for (let param in thisProduct.data.params) {
                //start loop for each option in param

                for (let option in thisProduct.data.params[param].options) {
                    //check if option is marked

                    // make helper variable
                    let check = 0;

                    // make const optionImages
                    const optionImages = thisProduct.imageWrapper.querySelector('.' + param + '-' + option);

                    //start loop for each marked option

                    for (let op of formData[param]) {

                        //if option is marked
                        if (option == op) {

                            check = 1;

                        }
                    }


                    // if option is marked
                    if (check == 1) {
                        // for each image in optionImages
                        for (let img in optionImages) {
                            // add class active to optionImages

                            optionImages.classList.add(classNames.menuProduct.imageVisible);

                        }
                        //check if option is not default
                        if (!thisProduct.data.params[param].options[option].default) {
                            // if not add price
                            price = price + thisProduct.data.params[param].options[option].price;
                        }

                    } else {
                        // for each image in optionImages
                        for (let img in optionImages) {
                            //remove class active

                            optionImages.classList.remove(classNames.menuProduct.imageVisible);

                        }
                        // if option is default
                        if (thisProduct.data.params[param].options[option].default) {
                            // reduce from price
                            price = price - thisProduct.data.params[param].options[option].price;
                        }

                    }




                }
            }
            /*multiply price by amount */

            price *= thisProduct.amountWidget.value;

            // insert price value to thisProduct.priceElem

            thisProduct.priceElem.innerHTML = price;

        }
    }

    app.init()
}
