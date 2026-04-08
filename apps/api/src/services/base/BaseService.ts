/**
 * Base service class providing common business logic patterns
 */
export abstract class BaseService {
  protected abstract repository: any;

  // Subclasses implement specific business logic
}

export default BaseService;
