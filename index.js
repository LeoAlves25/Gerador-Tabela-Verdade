const conectores = ["~", "/\\", "⊻", "\\/", "->", "<->"];

/**
 * 
 * @param { string } inputLinha 
 * @returns { string[] }
 */
const tokenizer = (inputLinha) => {
  const elementos = /(\s*~\s*|\s*\/\\\s*|\s*\⊻\s*|\s*\\\/\s*|\s*->\s*|\s*<->\s*|\s*\(\s*|\s*\)\s*| )/g
  // cut
  const inputVet = inputLinha.split(elementos).filter(value => value.length);
  return inputVet;
}

/**
 * Verificar os elementos do input.
 * 
 * @param {string} varNome 
 * @returns {boolean}
 */
const verificarElementos = (varNome) => {
  function verificarPrimeiroChar(char) {
    return (char === '_')
      || (char >= 'a' && char <= 'z')
      || (char >= 'A' && char <= 'Z')
  }
  // O primeiro caractere deve ser uma letra ou um sublinhado
  // Os caracteres restantes devem ser letras, sublinhados, números
  for (let i = 0; i < varNome.length; i++) {
    if (i === 0 && verificarPrimeiroChar(varNome[i])) {
      ;
    } else if (i == 0) {
      return false;
    } else if (
      verificarPrimeiroChar(varNome[i]) ||
      (varNome[i] >= '0' && varNome[i] <= '9')
    ) {
      ;
    } else {
      return false;
    }
  }
  return varNome.length > 0;
}

/**
 * Tranformar em expressão.
 * O inputVet deve ser válido.
 *
 * @param {string[]} inputVet
 */
const inToPost = (inputVet) => {
  let listaFormulas = [];
  let resultado = [];

  function condicaoSatisfatoria(index) {
    return listaFormulas.length
      && listaFormulas[listaFormulas.length - 1] !== '('
      && (conectores.indexOf(listaFormulas[listaFormulas.length - 1])) < index;
  }

  for (let it of inputVet) {
    const s = it.trim();
    if (s.length === 0) {
      ;
    } else if (s === '(') {
      listaFormulas.push(s);
    } else if (s === ')') {
      while (listaFormulas.length && listaFormulas[listaFormulas.length - 1] !== '(') {
        resultado.push(listaFormulas.pop());
      }
      if (listaFormulas.length) { // Se houver elementos dentro do listaFormulas, deve ser '('
        listaFormulas.pop();
      } else {
        resultado.push(')');
      }
    } else if (s === '~') {
      listaFormulas.push(s);
    } else if (s === '/\\') {
      while (condicaoSatisfatoria(2)) {
        resultado.push(listaFormulas.pop());
      }
      listaFormulas.push(s);
    } else if (s === '⊻') {
      while (condicaoSatisfatoria(3)) {
        resultado.push(listaFormulas.pop());
      }
      listaFormulas.push(s);
    } else if (s === '\\/') {
      while (condicaoSatisfatoria(4)) {
        resultado.push(listaFormulas.pop());
      }
      listaFormulas.push(s);
    } else if (s === '->') {
      while (condicaoSatisfatoria(5)) {
        resultado.push(listaFormulas.pop());
      }
      listaFormulas.push(s);
    } else if (s === '<->') {
      while (condicaoSatisfatoria(6)) {
        resultado.push(listaFormulas.pop());
      }
      listaFormulas.push(s);
    } else if (listaFormulas.length === 0) {
      listaFormulas.push(s);
    } else if (s) {
      resultado.push(s);
    }
  }
  while (listaFormulas.length) {
    resultado.push(listaFormulas.pop());
  }
  return resultado;
}

/**
 * Verifica a exatidão de inputLinha 
 * 
 * Regras:
 * var: verificarElementos(var) === true && não pode ser adjacente entre mais de uma variável.
 * parênteses: esquerda e direita têm os mesmos números && a frase entre parênteses está à direita.
 * conjunção: apenas ~ pode adjacente, e outros não são suportados.
 * 
 * @param { string[] } postExp
 * 
 * @returns { boolean }
 */
const checarErro = (postExp) => {
  let vetorChecado = [];
  for (let it of postExp) {
    if (it === '(' || it === ')') {
      erroInfo.innerHTML = "<span>" + it + "</span> erro na inclusão de parênteses."
      tabelaVerdade.innerHTML = "";
      return false;
    } else if (conectores.indexOf(it) !== -1) {
      if (it === '~') {
        const temp = vetorChecado.pop();
        if (temp !== '~'
          || !vetorChecado.length
          || !verificarElementos(temp)) {
          erroInfo.innerHTML = "<span>" + it + "</span> aguardando sentença..."
        }
        vetorChecado.push(temp);
      } else {
        const temp2 = vetorChecado.pop();
        if (!vetorChecado.length) {
          erroInfo.innerHTML = "<span>" + it + "</span> aguardando sentença..."
          return false;
        }
        const temp1 = vetorChecado.pop();
        if (!verificarElementos(temp2)) {
          erroInfo.innerHTML = "<span>" + temp2 + "</span> não é uma variável válida."
          tabelaVerdade.innerHTML = "";
          return false;
        } else if (!verificarElementos(temp1)) {
          erroInfo.innerHTML = "<span>" + temp1 + "</span> não é uma variável válida."
          tabelaVerdade.innerHTML = "";
          return false;
        }
        vetorChecado.push(temp1);
      }
    } else {
      if (!verificarElementos(it)) {
        erroInfo.innerHTML = "<span>" + it + "</span> não deveria estar aqui."
        tabelaVerdade.innerHTML = "";
        return false;
      }
      vetorChecado.push(it);
    }
  }

  if ((vetorChecado.length !== 1 && verificarElementos(vetorChecado[vetorChecado.length - 1]))
    || (vetorChecado.length == 1 && !verificarElementos(vetorChecado[vetorChecado.length - 1]))
  ) {
    erroInfo.innerHTML = "<span>" + vetorChecado[vetorChecado.length - 1] + "</span> não deveria estar aqui."
    tabelaVerdade.innerHTML = "";
    return false;
  }
  erroInfo.innerHTML = "";
  return true;
}

/**
 * transforme post-exp em in-exp com parênteses.
 * E também, o inputVet é pos-exp e deve ser válido.
 * @param {string[]} postExp
 */
function addParentesesFormula(postExp) {
  let listaFormulas = [];
  for (let it of postExp) {
    let s = it;
    if (s === 'T') {
      s = '⊤';
    } else if (s === 'F') {
      s = '⊥'
    }
    if (conectores.indexOf(s) !== -1) {
      let conjuncao;
      if (s === '~') {
        conjuncao = "(~" + listaFormulas.pop() + ")";
      } else {
        const tempProp2 = listaFormulas.pop();
        const tempProp1 = listaFormulas.pop();
        conjuncao = "(" + tempProp1 + " " + s + " " + tempProp2 + ")";
      }
      listaFormulas.push(conjuncao);
    } else if (s !== '(' && s !== ')') {
      listaFormulas.push(s);
    }
  }
  return listaFormulas.pop(); // Neste ponto, o tamanho interno da pilha deve ser 1.
}

/**
 * enumerar todos os casos e calcular
 * 
 * @param { string[] } postExp 
 * @param { string } inExpComParen
 */
const computarTudo = (postExp, inExpComParen) => {
  /**
   * remova a duplicata e não contenha verdadeiro e falso;
   */
  function removeVarDuplicadas() {
    return postExp.filter(value => value !== '(' && value !== ')' && value !== 'T' && value !== 'F' && conectores.indexOf(value) === -1).filter((value, index, arr) => arr.indexOf(value, index + 1) === -1);
  }

  function coletarTrueOuFalse() {
    return postExp.filter(value => value === 'T' || value === 'F');
  }

  /**
   * 
   * @param { object } valorFormula 
   */
  function computar(valorFormula) {
    /**
     * regras definidas
     * 
     * @param { boolean } input1 
     * @param { boolean } input2 
     * @param { string } sign 
     */
    function regras(input1, input2 = false, sign) {
      switch (sign) {
        case "/\\":
          return input1 && input2;
        case "\\/":
          return input1 || input2;
        case "~":
          return !input1;
        case "⊻":
          return input1 !== input2;
        case "->":
          return !input1 || input2;
        case "<->":
          return input1 === input2;
      }
    }

    let listaFormulas = [];
    for (let it of postExp) {
      if (conectores.indexOf(it) !== -1) {
        if (it === '~') {
          listaFormulas.push(regras(listaFormulas.pop(), false, it));
        } else {
          const temp1 = listaFormulas.pop();
          const temp2 = listaFormulas.pop();
          listaFormulas.push(regras(temp2, temp1, it));
        }
      } else if (it !== '(' && it !== ')') {
        if (it === 'T') {
          listaFormulas.push(true);
        } else if (it === 'F') {
          listaFormulas.push(false);
        } else {
          listaFormulas.push(valorFormula[it]);
        }
      }
    }
    return listaFormulas.pop(); // Neste ponto, o tamanho interno da pilha deve ser 1.
  }

  /**
   * criar td
   * 
   * @param {object} valorFormula 
   * @param {boolean} resultado 
   */

  function criarTableTd(valorFormula, resultado) {
    let tr = document.createElement('tr'); // Criar uma linha
    for (let it in valorFormula) {
      let td = document.createElement('td'); // Criar uma coluna
      const s = valorFormula[it] === true ? 'V' : 'F';
      td.innerHTML = "<span>" + s + "</span>";
      tr.appendChild(td);
    }
    let td = document.createElement('td');
    var resultado = "<span style='font-weight:600;'>" + resultado.toString().replace("true", "VERDADEIRO").replace("false", "FALSO") + "</span>"
    td.innerHTML = resultado;
    tr.appendChild(td);
    tabelaVerdade.appendChild(tr);
  }

  /**
   * listar todos os casos e computar
   * 
   * @param { string[] } allVar
   * @param { string[] } trueOrFalse
  */
  function listarTudo(allVar) {
    const tamMaximo = (2 ** allVar.length - 1).toString(2).length;
    for (let i = 0; allVar.length && i < 2 ** allVar.length; i++) {
      let bin = '';
      for (let j = i.toString(2).length; j < tamMaximo; j++) {
        bin += '0';
      }
      bin += i.toString(2);
      let valorFormula = {};
      for (let j = 0; j < bin.length; j++) {
        valorFormula[allVar[j]] = bin[j] === '1' ? true : false;
      }
      criarTableTd(valorFormula, computar(valorFormula));
    }
  }

  let tr = document.createElement('tr');
  const allVar = removeVarDuplicadas();
  const trueOrFalse = coletarTrueOuFalse();

  //Criar cabeçalho
  for (let it of allVar) {
    let th = document.createElement('th');
    if (it === 'T') {
      th.innerHTML = "<span>" + '⊤' + "</span>";
    } else if (it === 'F') {
      th.innerHTML = "<span>" + '⊥' + "</span>";
    } else {
      th.innerHTML = "<span>" + it + "</span>";
    }
    tr.appendChild(th);
  }
  let th = document.createElement('th');
  th.innerHTML = "<span style='font-weight:600;'>" + inExpComParen + "</span>";
  tr.appendChild(th);
  tabelaVerdade.appendChild(tr);
  listarTudo(allVar, trueOrFalse)
}



let input = document.getElementById('input')
let erroInfo = document.getElementById('error')
let tableDiv = document.getElementById('tabela-verdade');
let tabelaVerdade = document.createElement('table');
let botoes = document.getElementsByTagName('button');

// Função para calcular a tabela verdade e mostrar o resultado na tela
const calculo = () => {
  tabelaVerdade.innerHTML = ""
  if (!input.value.trim().length) {
    erroInfo.innerHTML = ""
    return;
  }
  let inputVet = tokenizer(input.value);
  const postExp = inToPost(inputVet);
  const checkResult = checarErro(postExp);
  if (!checkResult) {
    return;
  }
  const inExpComParen = addParentesesFormula(postExp);
  tableDiv.appendChild(tabelaVerdade)
  computarTudo(postExp, inExpComParen)
}

// Adicionar evento de input ao input de texto
input.addEventListener("input", () => {
  calculo();
})

// Adicionar eventos de clique aos botões da calculadora
for (let button of botoes) {
  button.addEventListener('click', e => {
    input.value = input.value + ` ${e.target.outerText} `;
    input.focus();
    calculo();
  })
}