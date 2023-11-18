# %%
from sklearn.decomposition import PCA
import plotly.express as px
import pandas as pd
import networkx as nx
import plotly.graph_objs as go
import plotly.offline as pyo
from embedding_functions import *
from experiment_setup import *
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt


# %%
# find intersection of two lists
def intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))


# find union of two lists
def union(list1, list2):
    final_list = list(list1) + list(list2)
    return final_list


def make_adjacency_matrix(n, source, target, weight=None):
    """
    Make adjacency matrix from source and target arrays.
    """

    if weight is None:
        weights = np.ones(len(n))
    else:
        weights = weight
    A1 = sparse.coo_matrix((weights, (source, target)), shape=(n, n))
    A2 = sparse.coo_matrix((weights, (target, source)), shape=(n, n))
    return A1 + A2


# %%

data = pd.read_csv("harry_potter_data/harry_potter.csv", sep=",")
attributes = pd.read_csv("harry_potter_data/HP-characters.csv", sep=",")


# find unique elements of a list
def unique(list1):
    unique_list = []
    for x in list1:
        if x not in unique_list:
            unique_list.append(x)
    return unique_list


present_ids = sorted(unique(union(data["source"].unique(), data["target"].unique())))
attributes = attributes[attributes["id"].isin(present_ids)].reset_index(drop=True)
nodes = list(attributes["name"])
n = len(nodes)
id_to_node = dict(zip(range(len(nodes)), nodes))

data = data.replace("-", 1)
data = data.replace("+", 0)

A = make_adjacency_matrix(n, data["source"], data["target"], data["type"])

# %%
# Add 5 empty columns to A
# A = sparse.hstack((A, sparse.csr_matrix((n, 5))))


# %%
# remove zero degree nodes
degrees = np.array(A.sum(axis=0)).flatten()
A = A[degrees > 0, :]
A = A[:, degrees > 0]

nodes = np.array(nodes)[degrees > 0]
degrees = degrees[degrees > 0]
n = len(nodes)

# degrees = np.sqrt(np.sqrt(degrees))

top_five_degree = np.argsort(degrees)[-5:]
top_five_degree_nodes = nodes[top_five_degree]
top_five_degree_class = np.where(np.isin(nodes, top_five_degree_nodes), "1", "0")

# %%
# %%
# Convert adjacency to edge list (including zeros)
edge_list = sparse.find(A)
edge_list = np.array(edge_list).T
edge_list = pd.DataFrame(edge_list, columns=["source", "target", "weight"])

# # Add zero weight edges to edge list
# zero_weight_edges = np.array(np.where(A.todense() == 0)).T
# zero_weight_edges = pd.DataFrame(zero_weight_edges, columns=["source", "target"])
# zero_weight_edges["weight"] = 0
# edge_list = pd.concat([edge_list, zero_weight_edges], axis=0).reset_index(drop=True)


# Save as csv
edge_list.to_csv("data/A.csv", index=False)


# %%
