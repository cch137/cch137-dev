// Last update: 20/11/2021

function unroll(arr) {
  function unrollFunc(arr,values) {
    if(arr instanceof Array) {
      let a_len = arr.length;
      let i=0;
      for(;i<a_len;i++) {
        if(arr[i] instanceof Array) {
          unrollFunc(arr[i],values)
        }
        else {
          values.push(arr[i])
        }
      }
      return values;
    }
    else {
      values.push(arr)
    }
  }
  return unrollFunc(arr,[]);
}

function shuffle(items) {
  function shuffleFunc(items) {
    let i_len = items.length;
    let times = i_len * 2;
    let tgt1,tgt2,temp;
    while(times--) {
      tgt1 = parseInt(i_len * Math.random());
      tgt2 = parseInt(i_len * Math.random());
      temp = items[tgt1];
      items[tgt1] = items[tgt2];
      items[tgt2] = temp;
    }
    return items;
  }
  return arrReplace(items,shuffleFunc(unroll(items)));
}

function arrReplace(arr,values) {
  function arrReplaceFunc(arr,values) {
    if(arr instanceof Array) {
      let a_len = arr.length;
      let result = new Array;
      let i=0;
      for(;i<a_len;i++) {
        if(arr[i] instanceof Array) {
          result.push(arrReplaceFunc(arr[i],values))
        }
        else {
          result.push(values[arrReplaceIndex++])
        }
      }
      return result;
    }
    if(values instanceof Array) return values[0];
    return values;
  }
  let arrReplaceIndex = 0;
  return arrReplaceFunc(arr,values);
}

function arrCompare(arr1,arr2) {
  if(arr1 instanceof Array && arr2 instanceof Array) {
    let a_len = arr1.length;
    if (a_len!=arr2.length) return false;
    let i=0;
    for(;i<a_len;i++) {
      if(arr1[i] instanceof Array && arr2[i] instanceof Array) {
        if(!(arrCompare(arr1[i],arr2[i]))) {
          return false
        }
      }else if(arr1[i] instanceof Array || arr2[i] instanceof Array) {
        return false
      }else if(arr1[i]!=arr2[i]) {
        return false
      }
    }
  }else if(arr1 instanceof Array || arr2 instanceof Array) {
    return false
  }else if(arr1!=arr2) {
    return false
  }
  return true
}

function inverse(values) {
  let i_len = values.length;
  let loop_t = parseInt(i_len/2);
  i_len--;
  for(i=0;i<loop_t;i++) {
    temp = values[i];
    values[i] = values[i_len-i];
    values[i_len-i] = temp;
  }
  return values;
}

function revise(key,range) {
  let value = _revise_group(key,range,0,1);
  let i_max = value.length;
  for(i=0;i<i_max;i++) {
    if(value[i+0]=='/')
    if(value[i+1]=='m')
    if(value[i+2]=='%')
    if(value[i+3]=='=')
    break
  }
  value = value.slice(0,i);
  if(value/1 === +value) return +value;
  return value;
}

function _revise_group(key,range,err,con) {
  let n_max = range.length;
  let max = 0;
  let temp = 0;
  let result = -1;
  if(err==undefined) err = 0.01;
  for(n=0;n<n_max;n++) {
    temp = _revise(key,range[n]);
    if(temp > max-err) {
      range[result]+=','+range[n];
    }
    if(temp > max) {
      max = temp;
      result = n;
    }
  };
  for(n=0;n<result;n++) {
    temp = _revise(key,range[n],con);
    if(temp > max-err) {
      range[result]+=','+range[n];
    }
  };
  if(result==-1) return '/m%=0';
  return range[result]+'/m%='+max;
}

function _revise(s1,s2,con) {
  s1 = s1.toString();
  s2 = s2.toString();
  if(con==undefined)con=0;

  let len_i = s1.length;
  let len_j = s2.length;
  let count = 0;
  let sum = 0;

  for(i=0;i<len_i;i++) {
    count = 0;
    for(j=0;j<=i;j++) {
      if(s1[i]==s1[j]) count++;
    }
    for(j=0;j<len_j;j++) {
      if(s1[i]==s2[j]) {
        if(!--count||(i+1)/len_i==(j+1)/len_j) {
          if(count) {count = len_i/2
          }
          else {
            count = i-j;
          }
          if(count<0) {
            count *= -1;
          }
          if(!count) {
            sum++;
          }
          else {
            sum += 1-(count/len_i);
          }
          count = 0;
          break;
        }
      }
    }
    if(count) {
      count = 0;
      for(j=0;j<len_j;j++) if(s1[i]==s2[j]) count++;
      if(count) {
        count /= len_i*len_j;
        sum += count;
      }
    }
  }
  if (len_i<len_j&&sum/len_i>2/3) {
    sum = sum/len_j
  }
  else {
    sum /= len_i
  }
  if(sum>1/3||con) return sum;
  return NaN;
}