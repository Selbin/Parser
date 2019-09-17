const valueParser = (input) => stringParser(input) || numberParser(input) || arrayParser(input) || boolparser(input) || nullParser(input) || objectParser(input)

const commaParser = input => input[0] === "," ? [",", input.slice(1)] : null

const boolparser = input => {
  if (input.startsWith("true"))
    return [true, input.slice(4)]
  if (input.startsWith("false"))
    return [false, input.slice(5)]
  return null
}

const nullParser = input => input.startsWith("null") ? [null, input.slice(4)] : null

const spaceParser = input => {
  let result = input.match(/^(\t|\n|\r| )+/)
  return (result === null ? null : [result[0], input.slice(result[0].length)])
}

const numberParser = input => {
  let result = input.match(/^-?([1-9][0-9]*(\.[0-9]+)?((e|E)[-+]?[0-9]+)?|0(\.[0-9]+)?((e|E)[-+]?[0-9]+)?)/)
  return (result === null || result[0] === "" ? null : [result[0] * 1, input.slice(result[0].length)])
}

function stringParser(input) {
  const result = []
  let escapeflag = false
  const escapeCharacter = ['"', "\\", "\/", "b", "f", "n", "r", "t"]
  const realEscapeCharacter = ['"', "\\", "\/", "\b", "\f", "\n", "\r", "\t"]
  if (input[0] == '"') {
    let i = 1
    while (i < input.length) {
      if ((i === input.length - 1) && (input[i] !== '"')) return null
      if (input[i] === '"') return [result.join(""), input.slice(i + 1)]
      if (input[i] === "\\") {

        escapeflag = true
        for (let characters of escapeCharacter) {
          if ((input[i + 1] === characters) && escapeflag) {
            result.push(realEscapeCharacter[escapeCharacter.indexOf(characters)])
            i = i + 1
            escapeflag = false
            break
          }
        }
        let unicodexpression = (input[i + 1] + input[i + 2] + input[i + 3] + input[i + 4] + input[i + 5]).match(/u[0-9a-fA-F]{4}/)
        if (unicodexpression !== null && escapeflag) {
          let unicode = input[i + 2] + input[i + 3] + input[i + 4] + input[i + 5]
          result.push(String.fromCharCode(parseInt(unicode, 16)))
          i = i + 5
          escapeflag = false
        }
        if (escapeflag) {
          return null
        }
      }
      else {
        if (input[i] === "\t" || input[i] === "\n" || input[i] === "\r" || input[i] === "\b" || input[i] === "\f" || input[i] === '"')
          return null
        result.push(input[i])
      }
      i++
    }
  }
  return null
}

const arrayParser = input => {
  let firstEntry = true
  let result = []
  if (input[0] === "[") {
    input = input.slice(1)
    let spaceparse = spaceParser(input.slice(0))
    if (spaceparse !== null) {
      input = spaceparse[1]
    }
    if (input[0] === ",")
      return null
    while (input[0] !== "]" && input.length > 1) {
      let space = spaceParser(input.slice(0))
      if (space !== null) {
        input = space[1]
        continue
      }
      let comma = commaParser(input.slice(0))
      if ((comma === null) && firstEntry === false) {
        return null
      } else {
        if (comma !== null)
          input = comma[1]
      }
      space = spaceParser(input.slice(0))
      if (space !== null) {
        input = space[1]
      }
      if (input[0]) {
        let value = valueParser(input.slice(0))
        if (value !== null) {

          result.push(value[0])
          input = value[1]
          firstEntry = false
          continue
        }
        return null
      }
    }
    if (input[0] === "]") {
      return [result, input.slice(1)]
    }
    return null
  }
  return null
}
const objectParser = input => {
  let key
  let keyflag = false
  let firstEntry = true
  let result = {}
  if (input[0] === "{") {
    input=input.slice(1)
    let spaceparse = spaceParser(input.slice(0))
    if (spaceparse !== null) {
      input = spaceparse[1]
    }
    if (input[0] === ",")
      return null
    while (input[0] !== "}" && input.length > 1) {
      let space = spaceParser(input.slice(0))
      if (space !== null) {
        input = space[1]
        continue
      }
      let comma = commaParser(input.slice(0))
      if ((comma === null) && firstEntry === false) {
        return null
      } else {
        if (comma !== null)
          input = comma[1]
      }
      space = spaceParser(input.slice(0))
      if (space !== null) {
        input = space[1]
      }
      if (keyflag === false) {
        keyflag = true
        key = stringParser(input.slice(0))
        if (key === null) {
          return null
        }
        else {
          input = key[1]
          key = key[0]
          space = spaceParser(input.slice(0))
          if (space !== null) {
            input = space[1]
          }
        }
      }
      if (input[0] === ":" && keyflag === true) {
        input = input.slice(1)
        space = spaceParser(input.slice(0))
        if (space !== null)
          input = space[1]
      } else {
        return null
      }
      if (keyflag === true) {
        let value = valueParser(input.slice(0))
        if (value === null) return null
        input = value[1]
        result[key] = value[0]
        keyflag = false
        firstEntry = false
        space = spaceParser(input.slice(0))
        if (space !== null) {
          input = space[1]
        }
      }
    }
    if (input[0] === "}") return [result, input.slice(1)]
    return null
  }
  return null
}
const jsonParser = (input) => {
  let result = objectParser(input) || arrayParser(input)
  if (result === null) return null
  if (result[1] === '' || result[1] === '\n') return result[0]
  return null
}
const fs = require('fs')
//for(let z=1 ;z<34;z++){
fs.readFile(`./test/passGS.json`, (err, data) => {
  if (err) throw err
  console.log(jsonParser(data.toString()))
})//}
