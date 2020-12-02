export class Generic{
    static httpBuildQuery(
        obj: any,
        numPrefix?: any,
        tempKey?: any,
    ): string {
        let output_string: any = []
        Object.keys(obj).forEach(function(val) {
            let key = val
            numPrefix && !isNaN(+key) && (key = numPrefix + key)
            key = encodeURIComponent(String(key).replace(/[!'()*]/g, encodeURI))
            tempKey && (key = tempKey + "[" + key + "]")

            if (typeof obj[val] === "object") {
            let query = this.httpBuildQuery(obj[val], null, key)
            output_string.push(query)
            } else {
            let value = encodeURIComponent(
                String(obj[val]).replace(/[!'()*]/g, encodeURI),
            )
            output_string.push(key + "=" + value)
            }
        })
        return output_string.join("&")
    }
}