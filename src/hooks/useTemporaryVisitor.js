/**
 * Hook para manejar usuarios temporales visitantes
 * Crea un ID único para cada visitante anónimo
 */
export const useTemporaryVisitor = () => {
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitorId', visitorId);
      localStorage.setItem('visitorCreated', new Date().toISOString());
    }
    return visitorId;
  };

  const clearVisitor = () => {
    localStorage.removeItem('visitorId');
    localStorage.removeItem('visitorCreated');
  };

  const getVisitorInfo = () => {
    const visitorId = localStorage.getItem('visitorId');
    const createdAt = localStorage.getItem('visitorCreated');
    return {
      visitorId,
      createdAt,
      isTemporaryVisitor: !!visitorId
    };
  };

  return {
    getVisitorId,
    clearVisitor,
    getVisitorInfo
  };
};
