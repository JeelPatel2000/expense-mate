export class DomainError extends Error {
  name = `DomainError`
  
  constructor(message?: string){
    super(message)
  }
}