/**
 * Format price input into number only
 * @param data: unformatted price
 */
 export const unformatPrice = (data) => {
  let price = '';
  if ( data ) {
      if ( typeof data === 'string' ) {
          for ( let i = 0; i < data.length; i++ ) {
              const value = parseInt(data.charAt(i));
              if ( value >= 0 && value <= 9 ) {
                  price += value;
              }
          }
          if ( data.includes('-') ) {
            return parseInt(price*-1);
          }
          else {
            return parseInt(price);
          }
      }
      else {
          return data;
      }
  }
  else {
    return '';
  }
};

/**
 * Format number to Indonesian currency
 * @param data: formatted price
 */
 export const formatToPrice = (data) => {
  if ( data ) {
      return 'Rp ' + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  else if ( data === 0 ) {
    return 'Rp 0';
  }
  else {
    return '';
  }
};

/**
 * Format number to price without 'Rp'
 * @param data: formatted number
 */
 export const formatPriceWithoutCurrency = (data) => {
  if ( data ) {
      return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  else if ( data === 0 ) {
    return '0';
  }
  else {
    return '';
  }
};
