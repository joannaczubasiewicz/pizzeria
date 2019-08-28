import { select } from './settings.js';
import AmountWidget from './components/AmoutWidget.js';



class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.singlePrice = menuProduct.singlePrice;

    thisCartProduct.amount = menuProduct.value;

    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //  console.log(thisCartProduct);
    //  console.log('product data:', menuProduct);

  }

  getData() {
    const thisCartProduct = this;
    thisCartProduct.data = {};
    thisCartProduct.data.id = thisCartProduct.id;
    thisCartProduct.data.amount = thisCartProduct.amount;
    thisCartProduct.data.price = thisCartProduct.price;
    thisCartProduct.data.priceSingle = thisCartProduct.singlePrice;
    thisCartProduct.data.params = thisCartProduct.params;
    return thisCartProduct.data;
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    //console.log('wykonuję metode remove');
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function() {
      event.preventDefault();

    });


    thisCartProduct.dom.remove.addEventListener('click', function() {
      event.preventDefault();
      thisCartProduct.remove();

    });

  }




  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }

  initAmountWidget() {
    const thisCartProduct = this;


    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.wrapper);

    thisCartProduct.dom.wrapper.addEventListener('updated', function() {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.singlePice * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

    });
  }
}

export default CartProduct;