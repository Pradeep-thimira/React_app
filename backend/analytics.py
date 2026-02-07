import networkx as nx
import geopandas as gpd
import pandas as pd
import zipfile
import os
import tempfile
import shutil
from shapely.geometry import LineString, Point

def load_shapefile_graph(zip_path):
    """
    Extracts a zip file, finds a .shp file, loads it into a GeoDataFrame,
    and converts it to a NetworkX MultiGraph.
    """
    temp_dir = tempfile.mkdtemp()
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Find the .shp file
        shp_file = None
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                if file.endswith('.shp'):
                    shp_file = os.path.join(root, file)
                    break
        
        if not shp_file:
            raise ValueError("No .shp file found in the uploaded zip.")

        gdf = gpd.read_file(shp_file)
        
        # Ensure we are working with LineStrings
        gdf = gdf[gdf.geometry.type == 'LineString']
        
        # Create Graph
        # We will use the coordinates as node identifiers
        G = nx.Graph()
        
        for idx, row in gdf.iterrows():
            geom = row.geometry
            u = geom.coords[0]
            v = geom.coords[-1]
            dist = geom.length
            
            # Add edge with geometry and length
            G.add_edge(u, v, weight=dist, geometry=geom, **row.drop('geometry').to_dict())
            
        return G, gdf.crs

    finally:
        shutil.rmtree(temp_dir)

def compute_edge_betweenness(G):
    """Calculates Edge Betweenness Centrality."""
    ebc = nx.edge_betweenness_centrality(G, weight='weight')
    nx.set_edge_attributes(G, ebc, 'value')
    return G

def compute_edge_closeness(G):
    """
    Calculates Closeness Centrality for edges.
    Approximation: Average of the closeness centrality of the two endpoint nodes.
    """
    # Compute node closeness
    node_cc = nx.closeness_centrality(G, distance='weight')
    
    # Map to edges
    edge_cc = {}
    for u, v, k in G.edges(data=True): # handle MultiGraph or Graph
        # For simple Graph u,v is enough
        val = (node_cc[u] + node_cc[v]) / 2
        edge_cc[(u, v)] = val
        
    nx.set_edge_attributes(G, edge_cc, 'value')
    return G

def compute_edge_connectivity(G):
    """
    Calculates Connectivity (Degree) for edges.
    Approximation: Average degree of the two endpoint nodes.
    """
    degree = dict(G.degree())
    max_deg = max(degree.values()) if degree else 1
    
    edge_conn = {}
    for u, v in G.edges():
        # Normalize
        val = ((degree[u] + degree[v]) / 2) / max_deg
        edge_conn[(u, v)] = val
        
    nx.set_edge_attributes(G, edge_conn, 'value')
    return G

# --- THE REGISTRY ---
ANALYSIS_TOOLS = {
    'betweenness': compute_edge_betweenness,
    'closeness': compute_edge_closeness,
    'connectivity': compute_edge_connectivity
}

def run_analysis_pipeline(zip_path, metric_type):
    """Orchestrates the flow: Load Shapefile -> Compute Edge Metric -> Serialize."""
    
    # 1. Load Data
    G, crs = load_shapefile_graph(zip_path)
    
    if len(G.edges) == 0:
        raise ValueError("Graph has no edges. Check shapefile.")

    # 2. Select Tool
    if metric_type not in ANALYSIS_TOOLS:
        raise ValueError(f"Unknown metric: {metric_type}")
    
    analysis_func = ANALYSIS_TOOLS[metric_type]
    
    # 3. Compute
    G_processed = analysis_func(G)

    # 4. Serialize to GeoJSON
    # We need to return the edges as a GeoDataFrame
    edges_data = []
    for u, v, data in G_processed.edges(data=True):
        edge_props = data.copy()
        # Ensure 'value' exists for visualization coloring
        if 'value' not in edge_props:
            edge_props['value'] = 0
        edges_data.append(edge_props)
        
    edges_gdf = gpd.GeoDataFrame(edges_data, crs=crs)
    
    # Reproject to WGS84 (EPSG:4326) for web visualization
    if edges_gdf.crs is not None:
        edges_gdf = edges_gdf.to_crs(epsg=4326)
    
    return edges_gdf.to_json()