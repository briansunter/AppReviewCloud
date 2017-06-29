export function count(arr){
    return arr.reduce(function(m,e){
        m[e] = (+m[e]||0)+1; return m;
    },{});
}

const concat = (x,y) => x.concat(y);
export function flatMap(f,xs) {return  xs.map(f).reduce(concat, []);};
