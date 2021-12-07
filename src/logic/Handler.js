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

/**
 * Format branch address into 1-3 lines
 * @param branch: branch's detail address
 */
 export const formatBranchAddress = (branch) => {
  if ( branch ) {
    let result = [];
    // Check top address
    let topAddress = branch.address;
    if ( branch.kelurahan ) {
      topAddress += (", " + branch.kelurahan);
    }
    if ( branch.kecamatan || branch.kabupaten || branch.provinsi || branch.kodepos ) {
      topAddress += ",";
    }
    result.push(topAddress);
    //Check middle address
    let middleAddress = "";
    if ( branch.kecamatan && branch.kabupaten ) {
      middleAddress = branch.kecamatan + ", " + branch.kabupaten;
    }
    else if ( branch.kecamatan && !branch.kabupaten ) {
      middleAddress = branch.kecamatan;
    }
    else if ( !branch.kecamatan && branch.kabupaten ) {
      middleAddress = branch.kabupaten;
    }
    if ( middleAddress && (branch.provinsi || branch.kodepos) ) {
      middleAddress += ",";
      result.push(middleAddress);
    }
    else if ( middleAddress ) {
      result.push(middleAddress);
    }
    //Check bottom address
    if ( branch.provinsi && branch.kodepos ) {
      result.push(branch.provinsi + ", " + branch.kodepos);
    }
    else if ( branch.provinsi && !branch.kodepos ) {
      result.push(branch.provinsi);
    }
    else if ( !branch.provinsi && branch.kodepos ) {
      result.push(branch.kodepos);
    }
    return result;
  }
  else return [];
}

/**
 * Return default store/branch address (Pangkalan Bun)
 */
 export const getDefaultAddress = () => {
  const result = [
    "Jl. Pakunegara No. 13 RT. 17, Kel. Raja,",
    "Kec. Arut Selatan, Kab. Kotawaringin Barat,",
    "Kalimantan Tengah",
  ];
  return result;
 }