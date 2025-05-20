import {
  AfterContentChecked,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import {TableModule} from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import {Button} from 'primeng/button';
import {isPlatformBrowser, NgForOf, NgIf} from '@angular/common';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

var acoesAnalisadas = [
  /*{ id: '4' , codigo: 'PETR4'},
  { id: '42', codigo: 'BBAS3'},
  { id: '44', codigo: 'ITUB4'},
  { id: '38', codigo: 'TAEE11'},
  { id: '590', codigo: 'CXSE3'},
  { id: '18', codigo: 'VALE3'},
  { id: '39', codigo: 'BBDC3'},*/
  { id: '2' , codigo: 'AAPL'},
  { id: '17' , codigo: 'MSFT'},
  { id: '6' , codigo: 'GOOG'},
  { id: '86' , codigo: 'NVDA'},
  { id: '4736' , codigo: 'META'},
  { id: '26' , codigo: 'ORCL'},
  { id: '52' , codigo: 'UBER'},
  { id: '51' , codigo: 'ABNB'},
  { id: '70' , codigo: 'ADBE'},
  { id: '208' , codigo: 'ADSK'},
  { id: '80' , codigo: 'MSI'},
  { id: '2515' , codigo: 'MPWR'},
  { id: '2141' , codigo: 'KLAC'},
  { id: '1547' , codigo: 'FTNT'},
  { id: '42' , codigo: 'QCOM'},
  { id: '4156' , codigo: 'SAP'},
  { id: '20' , codigo: 'NFLX'},
  { id: '1' , codigo: 'AMZN'},
  { id: '93' , codigo: 'AMD'},
  { id: '4827' , codigo: 'PLTR'},
  { id: '47' , codigo: 'JPM'},
  { id: '79' , codigo: 'HSBC'},
  { id: '16' , codigo: 'MA'},
  { id: '28' , codigo: 'V'},
  { id: '8' , codigo: 'MELI'},
  { id: '4675' , codigo: 'BRK-B'},
  { id: '4640' , codigo: 'NU'},
  { id: '4737' , codigo: 'INTR'},
  { id: '507' , codigo: 'AVGO'},
  { id: '452' , codigo: 'ASML'},
  /*{ id: '4816' , codigo: 'SOUN'},*/
  { id: '4497' , codigo: 'TSM'},
  { id: '4212' , codigo: 'ANET'},
  { id: '4188' , codigo: 'CRM'},
  { id: '2047' , codigo: 'ISRG'},
  { id: '876' , codigo: 'CHKP'},
  { id: '4838' , codigo: 'SOFI'},
  /*{ id: '1048' , codigo: 'CRWD'},*/

]

export class Acao {
  codigo?: string;
  preco?: string;
  graham?: string;
  upsideGraham?: string;
  plAtual?: string;
  pl3Anos?: string;
  plDiff?: string;
  pvpAtual?: string;
  pvp3Anos?: string;
  pvpDiff?: string;
  DYAtual?: string;

  constructor(codigo?: string) {
    this.codigo = codigo;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TableModule,  NgForOf, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  acoes: Acao[] = [];
  selectedAcoes!: Acao[];
  cols!: Column[];
  thead?: any;
  exportColumns!: ExportColumn[];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.thead = document.querySelector('#teste table thead') as HTMLElement;
      this.thead.style.height = '66px'
    }
  }

  private http = inject(HttpClient);

  ngOnInit() {
    this.cols = [
      { field: 'codigo', header: 'Código' },
      { field: 'preco', header: 'Preço' },
      { field: 'graham', header: 'Graham' },
      { field: 'upsideGraham', header: 'Upside Graham(%)' },
      { field: 'plAtual', header: 'P/L' },
      { field: 'pl3Anos', header: 'P/L (3 Anos)' },
      { field: 'plDiff', header: 'P/L (Diff)' },
      { field: 'pvpAtual', header: 'P/VP' },
      { field: 'pvp3Anos', header: 'P/VP (3 Anos)' },
      { field: 'pvpDiff', header: 'P/VP (Diff)' },
      { field: 'DYAtual', header: 'DY' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.preencherAcoes();
  }

  preencherAcoes() {
    for (let i = 0; i < acoesAnalisadas.length; i++) {
      let acao = new Acao(acoesAnalisadas[i].codigo);
      acao = this.getDadosAcao(acoesAnalisadas[i].id, acao);
      // @ts-ignore
      acao.upsideGraham = Number.parseFloat( (((acao.graham - acao.preco) / acao.preco ) * 100).toFixed(2) );
      // @ts-ignore
      acao.plDiff = Number.parseFloat( (acao.plAtual - acao.pl3Anos).toFixed(2) );
      // @ts-ignore
      acao.pvpDiff = Number.parseFloat( (acao.pvpAtual - acao.pvp3Anos).toFixed(2) );
      this.acoes.push(acao);
    }
  }

  // @ts-ignore
  getDadosAcao(idAcao: string, acao: Acao): Acao {
    //https://investidor10.com.br/api/historico-indicadores/${idAcao}/5/?v=2
    this.http.get(`https://investidor10.com.br/api/stock/historico-indicadores/${idAcao}/5/?v=2`)
      .subscribe({
        next: (data) => {
          // @ts-ignore
          acao.plAtual = Number.parseFloat( data['P/L'][0].value );
          // @ts-ignore
          acao.pl3Anos = Number.parseFloat( ((data['P/L'][1].value*1 + data['P/L'][2].value*1 + data['P/L'][3].value*1)/3).toFixed(2) );
          // @ts-ignore
          acao.pvpAtual = Number.parseFloat( data['P/VP'][0].value );
          // @ts-ignore
          acao.pvp3Anos = Number.parseFloat( ((data['P/VP'][1].value*1 + data['P/VP'][2].value*1 + data['P/VP'][3].value*1)/3).toFixed(2) );
          // @ts-ignore
          acao.DYAtual = Number.parseFloat( data['DIVIDEND YIELD (DY)'][0].value );
          // @ts-ignore
          acao.graham = Math.sqrt(data['VPA'][0].value * data['LPA'][0].value * 22.5).toFixed(2);
        },
        error: (err) => {
          console.error('Erro na requisição:', err);
        }
      });

    //https://investidor10.com.br/api/cotacao/ticker/${idAcao}
    this.http.get(`https://investidor10.com.br/api/stock/cotacoes/chart/${idAcao}/182/true`)
      .subscribe({
      next: (data) => {
        // @ts-ignore
        acao.preco = data[data.length-1]['price'];
      },
      error: (err) => {
        console.error('Erro na requisição:', err);
      }
    });
    return acao;
  }

  getWidth() {
    return (100 / this.cols.length).toFixed(2) + 'vw';
  }
}



