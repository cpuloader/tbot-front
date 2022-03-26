export function secondsToTime(seconds: number) {
    let hh = Math.floor(seconds / 3600);
    let mm = Math.floor((seconds - (hh * 3600)) / 60);
    let ss = Math.floor(seconds - (hh * 3600) - (mm * 60));

    if (hh > 0) {
        return hh.toString() + ':' + ((mm < 10) ? ('0' + mm.toString()) : mm.toString() ) + ':' + ss.toString();
    } else {
        return mm.toString() + ':' + ((ss < 10) ? ('0' + ss.toString()) : ss.toString() );
    }
}

export function addObjectAttrs(obj: any, attrName: any, attrs: any) {
    for (let att in attrs) {
        if (obj[attrName][att] === undefined) {
            obj[attrName][att] = attrs[att];
        }
    }
}

export function removeFirst<T>(array: T[], toRemove: T): void {
  const index = array.indexOf(toRemove);
  if (index > -1) {
    array.splice(index, 1);
  }
}
