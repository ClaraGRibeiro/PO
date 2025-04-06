const restricoes = [
    { a: 6, b: 4, c: 24 },
    { a: 1, b: 2, c: 6 },
    { a: -1, b: 1, c: 1 },
    { a: 0, b: 1, c: 2 },
    { a: -40, b: 10, c: 5 },
]

function adicionarRestricao() {
    const container = document.getElementById('restricoesContainer')
    const div = document.createElement('div')
    div.className = 'restricao'
    div.innerHTML = `
<input type="number" step="any" placeholder="a">x1 +
<input type="number" step="any" placeholder="b">x2 ≤
<input type="number" step="any" placeholder="c">
`
    container.appendChild(div)
}

function resolverPO() {
    const saida = document.getElementById('saida')
    const restricoesInputs = document.querySelectorAll('.restricao')
    const restricoes = []
    restricoesInputs.forEach(div => {
        const inputs = div.querySelectorAll('input')
        const a = parseFloat(inputs[0].value)
        const b = parseFloat(inputs[1].value)
        const c = parseFloat(inputs[2].value)
        if (!isNaN(a) && !isNaN(b) && !isNaN(c)) restricoes.push({ a, b, c })
    })

    const za = parseFloat(document.getElementById('za').value)
    const zb = parseFloat(document.getElementById('zb').value)
    if (isNaN(za) || isNaN(zb)) {
        return
    }
    const max = document.getElementById('max').checked ? 1 : 0
    const varMaisImportante = max ? (za > zb ? "x1" : "x2") : (za < zb ? "x1" : "x2")

    function calculaZ(x1, x2) {
        return za * x1 + zb * x2
    }

    function verificaRestricoes(x1, x2) {
        return restricoes.every(({ a, b, c }) => a * x1 + b * x2 <= c + 1e-9) && x1 >= 0 && x2 >= 0
    }

    const interseccao = (a1, b1, c1, a2, b2, c2) => {
        const det = a1 * b2 - a2 * b1
        if (det === 0) return null
        const x = (c1 * b2 - c2 * b1) / det
        const y = (a1 * c2 - a2 * c1) / det
        return { x1: x, x2: y }
    }

    let pontos = [{ x1: 0, x2: 0 }]

    restricoes.forEach(({ a, b, c }) => {
        if (a !== 0 && verificaRestricoes(c / a, 0)) pontos.push({ x1: c / a, x2: 0 })
        if (b !== 0 && verificaRestricoes(0, c / b)) pontos.push({ x1: 0, x2: c / b })
    })

    for (let i = 0; i < restricoes.length; i++) {
        for (let j = i + 1; j < restricoes.length; j++) {
            const r1 = restricoes[i], r2 = restricoes[j]
            const ponto = interseccao(r1.a, r1.b, r1.c, r2.a, r2.b, r2.c)
            if (ponto && verificaRestricoes(ponto.x1, ponto.x2)) pontos.push(ponto)
        }
    }

    pontos.sort((a, b) => {
        if (a.x1 == 0 && a.x2 == 0) return -1
        if (b.x1 == 0 && b.x2 == 0) return 1
        if (varMaisImportante === "x1") return b.x1 - a.x1 || b.x2 - a.x2
        else return b.x2 - a.x2 || b.x1 - a.x1
    })

    let solucaoOtima
    let Zsolucao
    let first = true

    for (const p of pontos) {
        const Z = calculaZ(p.x1, p.x2)
        if (first) {
            solucaoOtima = p
            Zsolucao = Z
            first = false
            continue
        }
        if (max) {
            if (Z > Zsolucao) {
                Zsolucao = Z
                solucaoOtima = p
            } else break
        } else {
            if (Z < Zsolucao) {
                Zsolucao = Z
                solucaoOtima = p
            } else break
        }
    }

    let resultado = `${max ? "Maximizar" : "Minimizar"}: Z = ${za}x1 + ${zb}x2\n`
    resultado += "Restrições:\n"
    restricoes.forEach((r, i) => resultado += `${i + 1}.) ${r.a}x1 + ${r.b}x2 <= ${r.c}\n`)
    resultado += "\nPontos Válidos:\n"
    pontos.forEach((p, i) => resultado += `${i + 1}.) (${p.x1.toFixed(2)}, ${p.x2.toFixed(2)}); Z = ${calculaZ(p.x1, p.x2).toFixed(2)}\n`)
    resultado += `\nSolução ótima:\nx* = (${solucaoOtima.x1.toFixed(2)}, ${solucaoOtima.x2.toFixed(2)})\nZ* = ${Zsolucao.toFixed(2)}`

    saida.textContent = resultado
}