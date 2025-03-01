// types.ts
// Aqui você define as interfaces que refletem as tabelas ou objetos do seu app.

export interface IUser {
    id: number;
    email: string;
    password?: string;
    curso_id: number;  // ID do curso ao qual o usuário pertence
  }
  
  export interface ICurso {
    id: number;
    nome: string;
  }
  
  export interface ICadeira {
    id: number;
    nome: string;
    curso_id: number;
  }
  
  export interface IAnotacao {
    id?: number;
    cadeira: string;
    descricao: string;
    dataHora: string;  // Em camelCase
    tipo?: string;
    user_id?: number;
  }
  