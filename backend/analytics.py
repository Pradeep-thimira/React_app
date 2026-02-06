import networkx as nx
import osmnx as ox

def get_graph(location_name):
    """Downloads road network from OpenStreetMap."""
    # 'drive' network type gets car roads. Use 'walk' for pedestrian analysis.
    G = ox.graph_from_place(location_name, network_type='drive')
    # Project to UTM for accurate metric calculations if needed, 
    # but for web viz, we often need WGS84. We stay in WGS84 for simplicity here.
    return G

def compute_betweenness(G):
    """Calculates Betweenness Centrality."""
    # Use weight='length' to consider physical distance
    bc = nx.betweenness_centrality(G, weight='length')
    # Inject values into node attributes
    nx.set_node_attributes(G, bc, 'centrality')
    return G

def compute_closeness(G):
    """Calculates Closeness Centrality."""
    cc = nx.closeness_centrality(G, distance='length')
    nx.set_node_attributes(G, cc, 'centrality')
    return G

def compute_connectivity(G):
    """Calculates Node Degree (Connectivity)."""
    # Degree is a simple measure of connectivity
    degree = dict(G.degree())
    # Normalize simply for visualization purposes (0 to 1 scale roughly)
    max_deg = max(degree.values()) if degree else 1
    norm_degree = {k: v/max_deg for k, v in degree.items()}
    nx.set_node_attributes(G, norm_degree, 'centrality')
    return G

# --- THE REGISTRY ---
# Register your tools here. String keys map to functions.
ANALYSIS_TOOLS = {
    'betweenness': compute_betweenness,
    'closeness': compute_closeness,
    'connectivity': compute_connectivity
}

def run_analysis_pipeline(location, metric_type):
    """Orchestrates the download -> compute -> serialize flow."""
    
    # 1. Fetch Data
    try:
        G = get_graph(location)
    except Exception as e:
        raise ValueError(f"Could not find location: {location}")

    # 2. Select Tool
    if metric_type not in ANALYSIS_TOOLS:
        raise ValueError(f"Unknown metric: {metric_type}")
    
    analysis_func = ANALYSIS_TOOLS[metric_type]
    
    # 3. Compute
    G_processed = analysis_func(G)

    # 4. Serialize to GeoJSON
    # graph_to_gdfs returns (nodes, edges) Geopandas dataframes
    nodes_gdf, edges_gdf = ox.graph_to_gdfs(G_processed)
    
    # We visualize Nodes (intersections) for centrality
    # Convert to GeoJSON string
    return nodes_gdf.to_json()