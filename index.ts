import * as readline from 'readline';
const gTTS = require('gtts');
const { exec } = require('child_process');

import axios from 'axios';

interface ICarro {
    marca: string;
    modelo: string;
    ano: number;
    preco: number;
    placa: string;
    velocidade: number;
    acelerar(): void;
    frear(): void;
}

interface IGps {
    origem: string;
    destino: string;
    calcularRota(origem:string, destino:string): void;
    verRota(): void;
    rotas: [];
}

class Carro implements ICarro, IGps {
    marca: string;
    modelo: string;
    ano: number;
    preco: number;
    velocidade: number;
    placa: string;

    origem: string;
    destino: string;
    rotas;

    calcularRota(origem:string, destino:string): void {
        console.log('Calculando rota...');
        const apiKey = 'AIzaSyAEbJlhjvCfMSTgFrPVWQtbeCkbkOr2YA0';
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origem}&destination=${destino}&key=${apiKey}&language=pt-BR`;

        axios.get(url)
            .then(response => {
                this.rotas = response.data.routes[0].legs[0].steps;
                console.log('Rota Calculada com sucesso!');
                perguntar(); // Voltar ao menu
            })
            .catch(error => {
                console.error('Erro ao calcular rota:', error);
                perguntar(); // Voltar ao menu
            });
        
    }

    stepRoute = 0;

    verRota(): void {
        console.log('Iniciando rota...');
        if (!this.rotas) {
            console.log('Rota não calculada');
            return;
        }
        const step = this.rotas[this.stepRoute];
        
        if (step) {
            console.clear();
            const text = step.html_instructions.replace(/<[^>]*>?/gm, '');
            console.log(text);
            const gtts = new gTTS(text, 'pt-br');

            gtts.save('output.mp3', function (err) {
                if (err) throw err;
                exec('mpg321 output.mp3', (error) => {
                    if (error) console.error(error);
                });
            });
        }
        if (!step) {
            const gtts = new gTTS("Rota Finalizada!!", 'pt-br');

            gtts.save('output.mp3', function (err) {
                if (err) throw err;
                exec('mpg321 output.mp3', (error) => {
                    if (error) console.error(error);
                });
            });
            return;
        }
    }


    constructor(marca: string, modelo: string, ano: number, preco: number,placa: string) {
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        this.preco = preco;
        this.placa = placa;
    }

    acelerar(): void {
        this.stepRoute++;
        meuCarro.verRota();
        
    }

    frear(): void {
        if (this.velocidade === 0) {
            console.log('O carro já está parado');
            return;
        }
        this.velocidade-= 10;
        console.log('Freando...');
        console.log('Velocidade atual: ', meuCarro.velocidade);
    }

    
}

const meuCarro = new Carro('Toyota', 'Corolla', 2020, 80000, 'ABC1234');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

meuCarro.velocidade = 0;



const perguntar = () => {
    rl.question(`
        =========================
        |       MENU            |
        | 1. Acelerar           |
        | 2. Frear              |
        | 3. GPS                |
        | 4. Iniciar Rota       |
        =========================
        `, (resposta) => {
        switch (resposta) {
            case '1':
                meuCarro.acelerar();
                break; 
            case '2':
                meuCarro.frear();
                break;
            case '3': 
                rl.question('Digite a origem: ', (origem) => {
                    rl.question('Digite o destino: ', (destino) => {
                        meuCarro.calcularRota(origem, destino);
                    });
                });
                break;
            case '4':
                meuCarro.verRota();
                break;
            default:
                console.log('Opção inválida');
                break;
        }
        perguntar();
    });
};

perguntar();


export default Carro;
