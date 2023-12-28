import {
  CardComponent,
  CardCVV,
  CardExpiry,
  CardNumber,
} from '@chargebee/chargebee-js-react-wrapper';
import React, { Component } from 'react';
import '../../scss/components/checkout/chargebee/ChargebeeCheckout.scss';
import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const urlEncode = function (data: any) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && !(data[p] == undefined || data[p] == null)) {
      str.push(encodeURIComponent(p) + '=' + (data[p] ? encodeURIComponent(data[p]) : ''));
    }
  }
  return str.join('&');
};

export default class ChargebeeCheckout extends Component {
  cardRef: any;
  state: any;
  cbInstance: any;
  constructor(props: any) {
    super(props);
    // Create ref to assign card-component
    this.cardRef = React.createRef();
    this.cbInstance = window.Chargebee.init({
      site: 'shubham-test',
      publishableKey: 'test_C6hQkncujNWjbdHai0LG6HpBHhnflcvKd',
    });
    console.log(this.cbInstance);
    this.state = {
      token: '',
      error: '',
      loading: false,
      firstName: '',
      options: {
        // Custom classes - applied on container elements based on field's state
        classes: {
          focus: 'focus',
          invalid: 'invalid',
          empty: 'empty',
          complete: 'complete',
        },

        style: {
          // Styles for default field state
          base: {
            color: '#333',
            fontWeight: '500',
            fontFamily: 'Roboto, Segoe UI, Helvetica Neue, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',

            ':focus': {
              color: '#424770',
            },

            '::placeholder': {
              color: 'transparent',
            },

            ':focus::placeholder': {
              color: '#7b808c',
            },

            ':-webkit-autofill': {
              webkitTextColor: '#333',
            },
          },

          // Styles for invalid field state
          invalid: {
            color: '#e41029',

            ':focus': {
              color: '#e44d5f',
            },
            '::placeholder': {
              color: '#FFCCA5',
            },
          },
        },

        // locale
        locale: 'en',

        // Custom placeholders
        placeholder: {
          number: '4111 1111 1111 1111',
          expiry: 'MM / YY',
          cvv: 'CVV',
        },
        currency: 'USD',

        // Custom fonts
        fonts: ['https://fonts.googleapis.com/css?family=Roboto:300,500,600'],
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.tokenize = this.tokenize.bind(this);
  }

  tokenize = () => {
    this.setState({ loading: true });

    // Call tokenize methods through  card component's ref
    this.cardRef.current
      .tokenize({})
      .then((data: any) => {
        this.setState({ loading: false, token: data.token, error: '' });
        // Call the function and log a confirmation message
        this.createPurchase().then(() => {
          console.log('purchase created!');
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          token: '',
          error: 'Problem while tokenizing your card details',
        });
      });
  };

  handleUpdatePM = () => {
    console.log('requesting ....');
    this.cbInstance.openCheckout({
      hostedPage() {
        console.log('requesting resource....');
        return axios
          .post(
            'http://localhost:8082/api/generate_update_payment_method_url',
            urlEncode({ plan_id: 'cbdemo_scale' }),
          )
          .then((response) => {
            console.log(response.data);
            response.data;
          })
          .catch((error) => {
            console.log(error);
          });
      },
      close() {
        console.log('update payment method closed');
      },
    });
  }

  createPurchase(): Promise<void> {
    const headers: Headers = new Headers();

    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const request: RequestInfo = new Request('http://localhost:3001/purchase', {
      // We need to set the `method` to `POST` and assign the headers
      method: 'POST',
      headers: headers,
    });

    // Send the request and print the response
    return fetch(request).then((res) => {
      console.log('got response:', res);
    });
  }

  handleChange: any = (event: Event) => {
    const target: any = event.target;
    const value = target.type === 'checkbox' ? target?.checked : target?.value;
    const name = target?.name;

    this.setState({
      [name]: value,
    });
  };

  render() {
    const { style, classes, locale, placeholder, fonts, currency } = this.state.options;

    return (
      <div className="ex1 container">
        <div className="ex1-wrap">
          <div className="ex1-fieldset">
            <div className="ex1-field">
              <input
                className={this.state.firstName ? 'ex1-input val' : 'ex1-input'}
                name="firstName"
                onChange={this.handleChange}
                placeholder="John Doe"
                type="text"
                value={this.state.firstName}
              />
              <label className="ex1-label" htmlFor="firstName">
                Name on Card
              </label>
              <i className="ex1-bar" />
            </div>

            {/* Pass all options as props to card component  */}
            {/* Assign ref to call internal methods */}
            <CardComponent
              className="fieldset field"
              classes={classes}
              fonts={fonts}
              locale={locale}
              onKeyPress={() => {
                return true;
              }}
              placeholder={placeholder}
              ref={this.cardRef}
              styles={style}
              currency={currency}
            >
              <div className="ex1-field">
                {/* Card number component */}
                <CardNumber className="ex1-input" />
                <label className="ex1-label" htmlFor="cardNumber">
                  Card Number
                </label>
                <i className="ex1-bar" />
              </div>

              <div className="ex1-fields">
                <div className="ex1-field">
                  {/* Card expiry component */}
                  <CardExpiry className="ex1-input" />
                  <label className="ex1-label" htmlFor="expiry">
                    Expiry
                  </label>
                  <i className="ex1-bar" />
                </div>

                <div className="ex1-field">
                  {/* Card cvv component */}
                  <CardCVV className="ex1-input" />
                  <label className="ex1-label" htmlFor="cvv">
                    CVC
                  </label>
                  <i className="ex1-bar" />
                </div>
              </div>
            </CardComponent>
          </div>
          <button
            className={this.state.loading ? 'submit ex1-button' : 'ex1-button'}
            onClick={this.tokenize}
            type="submit"
          >
            Pay $x & Tokenize
          </button>

          <div className="bodyContainer">
            <a href='#' onClick={this.handleUpdatePM}>
              Update payment method
            </a>
          </div>

          <a href="https://shubham-test.chargebee.com/pages/v3/SeawEcuP72e7cqSHQHf4w1YCTmw4fcaco/">
            <button>Checkout</button>
          </a>

          {this.state.error && (
            <div className="error" role="alert">
              {this.state.error}
            </div>
          )}
          {this.state.token && <div className="token">{this.state.token}</div>}
        </div>
      </div>
    );
  }
}
