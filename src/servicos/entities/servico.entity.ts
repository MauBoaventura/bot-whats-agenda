import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
  } from 'typeorm';
  
  @Entity('servicos')
  export class Servico {
    @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
    id: number;
  
    @Column()
    nome: string;
  
    @Column('int')
    duracao: number; // duração em minutos (ex: 60)
  
    @Column('decimal', { precision: 10, scale: 2 })
    preco: number;
  
    @Column()
    categoria: string;
  
    @Column({ default: true })
    status: boolean;
  
    @DeleteDateColumn()
    deletedAt?: Date;
  }
  