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
            thisCart.dom.productList = document.querySelector(select.containerOf.cart);


        }

        initActions() {
            const thisCart = this;

            thisCart.dom.toggleTrigger.addEventListener('click', function() {


                thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

            });

        }

        add(menuProduct) {
            const thisCart = this;

            /*generate HTML based on template*/

            const generatedHTML = templates.cartProduct(menuProduct);

            console.log(generatedHTML);

            /*create DOM element using utils.createElementFromHTML*/

            const generatedDom = utils.createDOMFromHTML(generatedHTML);


            /*add element to cart*/
            thisCart.dom.productList.appendChild(generatedDom);


            console.log('adding product:', menuProduct);
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


                }
            );


            /* END: click event listener to trigger */

        };

        addToCart() {
            const thisProduct = this;
            thisProduct.name = thisProduct.data.name;
            thisProduct.value = thisProduct.amountWidget.value;
            app.cart.add(thisProduct);

        }

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
                thisProduct.addToCart();

            });
        }



        processOrder() {
            const thisProduct = this;
            ////console.log('processOrder');


            /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
            const formData = utils.serializeFormToObject(thisProduct.form);
            ////console.log('formData', formData);

            //set empty object to thisProduct.params

            thisProduct.params = {};

            /* set variable price to equal thisProduct.data.price */
            let price = thisProduct.data.price;
            ////console.log('price', price);

            /* START LOOP: for each paramId in thisProduct.data.params */
            for (let paramId in thisProduct.data.params) {

                /* save the element in thisProduct.data.params with key paramId as const param */
                const param = thisProduct.data.params[paramId];

                /* START LOOP: for each optionId in param.options */
                for (let optionId in param.options) {

                    /* save the element in param.options with key optionId as const option */
                    const option = param.options[optionId];

                    /* make a new constant optionSelected...  */
                    const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

                    /* START IF: if option is selected and option is not default */
                    if (optionSelected && !option.default) {

                        /* add price of option to variable price */
                        price += option.price;
                    } else if (!optionSelected && option.default) {

                        /* decrease the price by the price of that option */
                        price -= option.price;

                        /* END ELSE IF: if option is not selected and option is default */
                    }

                    const allPicImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

                    /* START IF: if option is selected */
                    if (optionSelected) {

                        if (!thisProduct.params[paramId]) {
                            thisProduct.params[paramId] = {
                                label: param.label,
                                options: {},
                            };

                        }
                        thisProduct.params[paramId].options[optionId] = option.label;

                        /* START LOOP: for each image of the option) */
                        for (let picImage of allPicImages) {

                            /* selected image add class active */
                            picImage.classList.add(classNames.menuProduct.imageVisible);

                            /* END LOOP: for each image of the option */
                        }

                        /* ELSE: if option is not selected*/
                    } else {

                        /* START LOOP: for each image of the option */
                        for (let picImage of allPicImages) {

                            /* unselected image remove class active */
                            picImage.classList.remove('active');

                            /* END LOOP: for each image of the option */
                        }

                        /* END IF: if option is not selected */
                    }

                    /* END LOOP: for each optionId in param.options */
                }
                /* END LOOP: for each paramId in thisProduct.data.params */
                console.log(thisProduct.params);
            }


            /*multiply price by amount */

            thisProduct.singlePice = price;
            thisProduct.price = thisProduct.singlePice * thisProduct.amountWidget.value;

            // insert price value to thisProduct.priceElem

            thisProduct.priceElem.innerHTML = thisProduct.price;

            //console.log(thisProduct.params);
        }
    }

    app.init()
}
